"use client";
import { useSessionStore } from "@/store/use-session-store";

import Link from "next/link";
import { Send } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Avatar, Button, Card } from "@/components/ui";
import { users as mockUsers } from "@/data/mock";
import { moderateContent } from "@/lib/moderation";
import type { Conversation, Message, User } from "@/types";
import { ReportButton } from "./report-button";


const systemConversation: Conversation = {
  id: "c_system",
  target: mockUsers[0],
  project: "系统通知",
  lastMessage: "平台通知与审核提醒",
  time: "刚刚",
  unread: 0,
  kind: "system"
};

export function MessageCenter() {
  const { activeUserId, loading } = useSessionStore();
  if (loading) return <p role="status">正在加载私信…</p>;
  if (!activeUserId) return <Link href="/login?next=%2Fmessages">请先登录查看私信</Link>;
  return <MessageContent key={activeUserId} currentUserId={activeUserId} />;
}

function MessageContent({ currentUserId }: { currentUserId: string }) {
  const searchParams = useSearchParams();
  const targetId = searchParams.get("targetId");
  const [activeId, setActiveId] = useState("c_system");
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState("");
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [directConversations, setDirectConversations] = useState<Conversation[]>([]);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [adminMessages, setAdminMessages] = useState<Array<{ id: string; title: string; body: string; createdAt: string }>>([]);

  useEffect(() => {
    if (!currentUserId) return;
    fetch("/api/users", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { items?: User[] }) => {
        if (data.items?.length) setUsers(data.items);
      })
      .catch(() => undefined);

    fetch(`/api/messages?userId=${currentUserId}`, { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { items?: Message[]; conversations?: Conversation[] }) => {
        setLocalMessages(data.items ?? []);
        setDirectConversations(uniqueConversations(data.conversations ?? []));
      })
      .catch(() => undefined);

    fetch("/api/system-messages")
      .then((response) => response.json())
      .then((data: { items?: Array<{ id: string; title: string; body: string; createdAt: string }> }) => {
        setAdminMessages(data.items ?? []);
      })
      .catch(() => undefined);
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId || !targetId || targetId === currentUserId) return;
    const target = users.find((user) => user.id === targetId);
    if (!target) return;
    const draftConversationId = directConversationId(currentUserId, targetId);
    const draftConversation: Conversation = {
      id: draftConversationId,
      target,
      project: "新的私信",
      lastMessage: "对方回复前只能发送一条消息",
      time: "现在",
      unread: 0,
      kind: "direct"
    };
    setDirectConversations((current) => {
      const existing = current.find((conversation) => conversation.id === draftConversationId || conversation.target.id === targetId);
      if (existing) {
        setActiveId(existing.id);
        return uniqueConversations(current);
      }
      setActiveId(draftConversation.id);
      return uniqueConversations([draftConversation, ...current]);
    });
  }, [targetId, users, currentUserId]);

  const visibleDirectConversations = useMemo(() => uniqueConversations(directConversations), [directConversations]);
  const conversations = [systemConversation, ...visibleDirectConversations];
  const activeConversation = conversations.find((conversation) => conversation.id === activeId) ?? systemConversation;
  const activeMessages = localMessages.filter((message) => message.conversationId === activeConversation.id);
  const activePeerId = activeConversation.kind === "direct" ? activeConversation.target.id : "";
  const hasSent = activeMessages.some((message) => message.senderId === currentUserId);
  const hasReply = activeMessages.some((message) => message.senderId === activePeerId);
  const lockedUntilReply = activeConversation.kind === "direct" && hasSent && !hasReply;

  const systemItems = useMemo(
    () => [
      ...adminMessages.map((item) => ({
        id: item.id,
        title: item.title,
        body: item.body,
        time: new Date(item.createdAt).toLocaleString("zh-CN"),
        unread: true
      }))
    ],
    [adminMessages]
  );

  async function sendMessage() {
    const trimmed = draft.trim();
    if (!trimmed || activeConversation.kind !== "direct") return;
    if (lockedUntilReply) {
      setNotice("对方回复前只能发送一条私信。");
      return;
    }

    const moderation = moderateContent(trimmed);
    if (moderation.decision !== "allow") {
      setNotice(moderation.message);
      return;
    }

    const response = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId: activeConversation.target.id, content: trimmed })
    });
    const data = (await response.json().catch(() => ({}))) as { item?: Message; message?: string; moderation?: { message: string } };

    if (!response.ok) {
      setNotice(data.message ?? data.moderation?.message ?? "私信发送失败。");
      return;
    }

    setNotice("");
    if (data.item) {
      setLocalMessages((current) => [...current, data.item!]);
      setDirectConversations((current) =>
        current.map((conversation) =>
          conversation.id === activeConversation.id
            ? { ...conversation, lastMessage: data.item!.content, time: data.item!.time, project: "私信对话" }
            : conversation
        )
      );
    }
    setDraft("");
  }

  return (
    <div className="grid min-h-[calc(100vh-6rem)] gap-4 lg:grid-cols-[320px_1fr]">
      <Card className="overflow-hidden">
        <div className="border-b border-line p-4">
          <h1 className="text-xl font-black">私信</h1>
          <p className="mt-1 text-sm text-neutral-500">先发一条，等对方回复后再进入互通状态。</p>
        </div>

        <div className="p-3">
          <ConversationButton conversation={systemConversation} active={activeId === systemConversation.id} onClick={() => setActiveId(systemConversation.id)} />
          <div className="mb-2 mt-4 px-1 text-xs font-black text-neutral-500">对话</div>
          <div className="space-y-1">
            {visibleDirectConversations.map((conversation) => (
              <ConversationButton key={conversation.id} conversation={conversation} active={activeId === conversation.id} onClick={() => setActiveId(conversation.id)} />
            ))}
          </div>
        </div>
      </Card>

      <Card className="flex min-h-0 flex-col overflow-hidden">
        <div className="flex items-center gap-3 border-b border-line p-4">
          <Avatar label={activeConversation.target.avatar} />
          <div>
            <div className="font-black">{activeConversation.target.name}</div>
            <div className="text-xs text-neutral-500">{activeConversation.project}</div>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto bg-paper p-4">
          {activeConversation.kind === "system" ? (
            systemItems.map((item) => (
              <article key={item.id} className="rounded-lg border border-line bg-white p-4">
                <div className="flex items-center gap-2">
                  {item.unread && <span className="size-2 rounded-full bg-brand-600" />}
                  <h2 className="text-sm font-black">{item.title}</h2>
                  <span className="ml-auto text-xs text-neutral-500">{item.time}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-neutral-600">{item.body}</p>
              </article>
            ))
          ) : activeMessages.length ? (
            activeMessages.map((message) => {
              const mine = message.senderId === currentUserId;
              const sender = users.find((user) => user.id === message.senderId);
              return (
                <div key={message.id} className={`flex gap-2 ${mine ? "justify-end" : "justify-start"}`}>
                  {!mine && sender && <Avatar label={sender.avatar} className="size-8" />}
                  <div className={`max-w-[78%] rounded-lg px-4 py-3 text-sm leading-6 ${mine ? "bg-brand-600 text-white" : "bg-white text-neutral-700"}`}>
                    {message.content}
                    <div className={`mt-1 flex items-center gap-2 text-xs ${mine ? "text-white/70" : "text-neutral-400"}`}>
                      <span>{message.time}</span>
                      {!mine && (
                        <ReportButton
                          targetType="message"
                          targetId={message.id}
                          accusedName={sender?.name ?? "未知用户"}
                          snapshot={message.content}
                          compact
                          className="text-neutral-400 hover:text-red-700"
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-lg border border-dashed border-line bg-white p-5 text-sm text-neutral-500">
              还没有消息。你可以先发一条自我介绍或说明协作意向。
            </div>
          )}
        </div>

        {activeConversation.kind === "direct" && (
          <div className="border-t border-line p-4">
            {(notice || lockedUntilReply) && (
              <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
                {notice || "对方回复前只能发送一条私信。"}
              </div>
            )}
            <div className="flex gap-3">
              <input
                value={draft}
                onChange={(event) => {
                  setDraft(event.target.value);
                  if (notice) setNotice("");
                }}
                disabled={lockedUntilReply}
                className="h-11 flex-1 rounded-lg border border-line bg-white px-4 text-sm outline-none focus:border-brand-500 disabled:bg-neutral-100"
                placeholder={lockedUntilReply ? "等待对方回复后可继续发送" : "输入私信内容"}
              />
              <Button size="icon" aria-label="发送私信" onClick={sendMessage} disabled={lockedUntilReply}>
                <Send size={17} />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function ConversationButton({ conversation, active, onClick }: { conversation: Conversation; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex w-full gap-3 rounded-lg p-3 text-left ${active ? "bg-brand-50" : "hover:bg-paper"}`}>
      <Avatar label={conversation.target.avatar} className="size-9" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <div className="truncate text-sm font-black">{conversation.target.name}</div>
          <div className="text-xs text-neutral-500">{conversation.time}</div>
        </div>
        <div className="mt-1 truncate text-xs font-semibold text-brand-700">{conversation.project}</div>
        <div className="mt-1 truncate text-sm text-neutral-500">{conversation.lastMessage}</div>
      </div>
      {conversation.unread > 0 && <span className="mt-1 grid size-5 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">{conversation.unread}</span>}
    </button>
  );
}

function directConversationId(a: string, b: string) {
  return `dm_${[a, b].sort().join("_")}`;
}

function uniqueConversations(conversations: Conversation[]) {
  const seen = new Set<string>();
  return conversations.filter((conversation) => {
    const key = conversation.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
