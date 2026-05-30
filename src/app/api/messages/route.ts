import { NextResponse } from "next/server";
import { ensureCommunitySeed, toMessage, toUser } from "@/lib/community-db";
import { clearMessagesCache, getCachedMessagesPayload, setCachedMessagesPayload } from "@/lib/messages-cache";
import { moderateContent } from "@/lib/moderation";
import { prisma } from "@/lib/prisma";
import type { Conversation, Message, User } from "@/types";

const CURRENT_USER_ID = "u_001";

interface MessagesPayload {
  conversations: Conversation[];
  items: Message[];
  source: "database" | "redis";
}

export async function GET(request: Request) {
  await ensureCommunitySeed();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") ?? CURRENT_USER_ID;

  const cached = await getCachedMessagesPayload<MessagesPayload>(userId);
  if (cached) return NextResponse.json({ ok: true, ...cached, source: "redis" });

  const [messageRows, userRows] = await Promise.all([
    prisma.directMessage.findMany({
      where: {
        moderationStatus: "approved"
      },
      orderBy: { createdAt: "asc" }
    }),
    prisma.hubUser.findMany({ orderBy: { createdAt: "asc" } })
  ]);

  const users = userRows.map(toUser);
  const items = messageRows.map(toMessage).filter((message) => {
    if (message.receiverId) return message.senderId === userId || message.receiverId === userId;
    return message.conversationId !== "c_system";
  });
  const payload: MessagesPayload = {
    conversations: buildConversations(userId, items, users),
    items,
    source: "database"
  };
  await setCachedMessagesPayload(userId, payload);
  return NextResponse.json({ ok: true, ...payload });
}

export async function POST(request: Request) {
  await ensureCommunitySeed();
  const body = await request.json();
  const senderId = String(body.senderId ?? CURRENT_USER_ID);
  const receiverId = String(body.receiverId ?? "");
  const content = String(body.content ?? "").trim();

  if (!receiverId || receiverId === senderId) {
    return NextResponse.json({ ok: false, error: "invalid_receiver" }, { status: 400 });
  }
  if (!content) {
    return NextResponse.json({ ok: false, error: "empty_content" }, { status: 400 });
  }

  const [sender, receiver] = await Promise.all([
    prisma.hubUser.findUnique({ where: { id: senderId } }),
    prisma.hubUser.findUnique({ where: { id: receiverId } })
  ]);
  if (!sender || !receiver) return NextResponse.json({ ok: false, error: "user_not_found" }, { status: 404 });

  const conversationId = directConversationId(senderId, receiverId);
  const allExisting = (await prisma.directMessage.findMany({
    where: { moderationStatus: "approved" },
    orderBy: { createdAt: "asc" }
  })).map(toMessage);
  const existing = allExisting.filter((message) => {
    if (message.conversationId === conversationId) return true;
    const peerId = inferPeerId(senderId, message, allExisting);
    return peerId === receiverId;
  });
  const senderHasSent = existing.some((message) => message.senderId === senderId);
  const receiverHasReplied = existing.some((message) => message.senderId === receiverId);

  if (senderHasSent && !receiverHasReplied) {
    return NextResponse.json(
      {
        ok: false,
        error: "pending_reply",
        message: "对方回复前只能发送一条私信。"
      },
      { status: 403 }
    );
  }

  const moderation = moderateContent(content);
  const row = await prisma.directMessage.create({
    data: {
      id: `m_${Date.now()}`,
      conversationId,
      senderId,
      receiverId,
      content,
      moderationStatus: moderation.decision === "block" ? "blocked" : moderation.decision === "allow" ? "approved" : "pending",
      reviewNote: moderation.message
    }
  });

  await clearMessagesCache(senderId, receiverId);

  if (moderation.decision === "block") {
    return NextResponse.json({ ok: false, error: "content_blocked", item: toMessage(row), moderation }, { status: 400 });
  }
  if (moderation.decision === "review") {
    return NextResponse.json({ ok: false, error: "content_review", item: toMessage(row), moderation }, { status: 202 });
  }

  return NextResponse.json({ ok: true, item: toMessage(row) });
}

function directConversationId(a: string, b: string) {
  return `dm_${[a, b].sort().join("_")}`;
}

function buildConversations(currentUserId: string, messages: Message[], users: User[]): Conversation[] {
  const grouped = new Map<string, Message[]>();
  for (const message of messages) {
    const peerId = inferPeerId(currentUserId, message, messages);
    if (!peerId || peerId === currentUserId) continue;
    const conversationId = directConversationId(currentUserId, peerId);
    grouped.set(conversationId, [...(grouped.get(conversationId) ?? []), message]);
  }

  return [...grouped.entries()]
    .map(([id, group]) => {
      const latest = group[group.length - 1];
      const peerId = inferPeerId(currentUserId, latest, group);
      const target = users.find((user) => user.id === peerId) ?? users[0];
      return {
        id,
        target,
        project: "私信对话",
        lastMessage: latest.content,
        time: latest.time,
        unread: group.filter((message) => message.senderId !== currentUserId).length,
        kind: "direct" as const
      };
    })
    .sort((a, b) => (a.time < b.time ? 1 : -1));
}

function inferPeerId(currentUserId: string, message: Message, messages: Message[]) {
  if (message.receiverId) return message.senderId === currentUserId ? message.receiverId : message.senderId;
  if (message.senderId !== currentUserId) return message.senderId;
  return messages.find((item) => item.conversationId === message.conversationId && item.senderId !== currentUserId)?.senderId ?? null;
}
