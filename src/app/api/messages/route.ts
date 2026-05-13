import { NextResponse } from "next/server";
import { ensureCommunitySeed, toMessage } from "@/lib/community-db";
import { moderateContent } from "@/lib/moderation";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await ensureCommunitySeed();
  const rows = await prisma.directMessage.findMany({
    where: { moderationStatus: { notIn: ["blocked", "rejected"] } },
    orderBy: { createdAt: "asc" }
  });
  return NextResponse.json({ ok: true, items: rows.map(toMessage) });
}

export async function POST(request: Request) {
  await ensureCommunitySeed();
  const body = await request.json();
  const senderId = String(body.senderId ?? "u_001");
  const moderation = moderateContent(String(body.content ?? ""), { allowContactInfo: true });

  const row = await prisma.directMessage.create({
    data: {
      id: `m_${Date.now()}`,
      conversationId: String(body.conversationId ?? "c_001"),
      senderId,
      receiverId: body.receiverId ? String(body.receiverId) : null,
      content: String(body.content ?? ""),
      moderationStatus: moderation.decision === "block" ? "blocked" : moderation.decision === "allow" ? "approved" : "pending",
      reviewNote: moderation.message
    }
  });
  if (moderation.decision === "block") {
    return NextResponse.json({ ok: false, error: "content_blocked", item: toMessage(row), moderation }, { status: 400 });
  }
  return NextResponse.json({ ok: true, item: toMessage(row) });
}
