import { NextResponse } from "next/server";
import { ensureCommunitySeed, toComment } from "@/lib/community-db";
import { moderateContent } from "@/lib/moderation";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureCommunitySeed();
  const { id } = await params;
  const rows = await prisma.postComment.findMany({
    where: { postId: id, moderationStatus: { notIn: ["blocked", "rejected"] } },
    orderBy: { createdAt: "asc" }
  });
  return NextResponse.json({ ok: true, items: rows.map(toComment) });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureCommunitySeed();
  const { id } = await params;
  const body = await request.json();
  const authorId = String(body.authorId ?? "u_001");
  const author = await prisma.hubUser.findUnique({ where: { id: authorId } });
  if (!author) return NextResponse.json({ ok: false, error: "author_not_found" }, { status: 404 });

  const moderation = moderateContent(String(body.content ?? ""));
  if (moderation.decision === "block") {
    return NextResponse.json({ ok: false, error: "content_blocked", moderation }, { status: 400 });
  }

  const row = await prisma.postComment.create({
    data: {
      id: `cm_${Date.now()}`,
      postId: id,
      authorId,
      authorName: author.name,
      authorAvatar: author.avatar,
      content: String(body.content ?? ""),
      moderationStatus: moderation.decision === "allow" ? "approved" : "pending",
      reviewNote: moderation.message,
      replyTo: body.replyTo ? String(body.replyTo) : null,
      mine: authorId === "u_001"
    }
  });
  return NextResponse.json({ ok: true, item: toComment(row) });
}
