import { userAccess } from "@/lib/user-auth";
import { NextResponse } from "next/server";
import { comments as mockComments } from "@/data/mock";
import { ensureCommunitySeed, toComment } from "@/lib/community-db";
import { moderateContent } from "@/lib/moderation";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await ensureCommunitySeed();
    const rows = await prisma.postComment.findMany({
      where: { postId: id, moderationStatus: "approved" },
      orderBy: { createdAt: "asc" }
    });
    return NextResponse.json({ ok: true, items: rows.map(toComment), source: "database" });
  } catch {
    console.warn("[api/posts/:id/comments] database unavailable, using mock comments");
    return NextResponse.json({ ok: true, items: mockComments.filter((comment) => comment.postId === id), source: "mock" });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessionUser = await userAccess();
  if (sessionUser instanceof NextResponse) return sessionUser;
  const { id } = await params;
  const body = await request.json();
  const authorId = sessionUser.id;
  const moderation = moderateContent(String(body.content ?? ""));
  if (moderation.decision === "block") {
    return NextResponse.json({ ok: false, error: "content_blocked", moderation }, { status: 400 });
  }

  try {
    await ensureCommunitySeed();
    const author = await prisma.hubUser.findUnique({ where: { id: authorId } });
    if (!author) return NextResponse.json({ ok: false, error: "author_not_found" }, { status: 404 });

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
        mine: false
      }
    });
    return NextResponse.json({ ok: true, item: toComment(row), source: "database" });
  } catch {
    return NextResponse.json({ ok: false, message: "评论保存失败，请稍后重试。" }, { status: 503 });
  }
}
