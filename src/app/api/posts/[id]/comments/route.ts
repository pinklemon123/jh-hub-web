import { NextResponse } from "next/server";
import { comments as mockComments, users as mockUsers } from "@/data/mock";
import { ensureCommunitySeed, toComment } from "@/lib/community-db";
import { moderateContent } from "@/lib/moderation";
import { prisma } from "@/lib/prisma";
import type { Comment } from "@/types";

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
  const { id } = await params;
  const body = await request.json();
  const authorId = String(body.authorId ?? "u_001");
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
        mine: authorId === "u_001"
      }
    });
    return NextResponse.json({ ok: true, item: toComment(row), source: "database" });
  } catch {
    console.warn("[api/posts/:id/comments] database unavailable, returning mock-created comment");
    const author = mockUsers.find((user) => user.id === authorId) ?? mockUsers.find((user) => user.id === "u_001") ?? mockUsers[0];
    const item: Comment = {
      id: `cm_${Date.now()}`,
      postId: id,
      authorId,
      author: author.name,
      authorAvatar: author.avatar,
      content: String(body.content ?? ""),
      time: "刚刚",
      replyTo: body.replyTo ? String(body.replyTo) : undefined,
      mine: authorId === "u_001"
    };
    return NextResponse.json({ ok: true, item, source: "mock" });
  }
}
