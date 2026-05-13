import { NextResponse } from "next/server";
import { posts as mockPosts, users as mockUsers } from "@/data/mock";
import { ensureCommunitySeed, toPost } from "@/lib/community-db";
import { moderateContent } from "@/lib/moderation";
import { prisma } from "@/lib/prisma";
import type { Post } from "@/types";

export async function GET() {
  try {
    await ensureCommunitySeed();
    const rows = await prisma.communityPost.findMany({
      where: { moderationStatus: { notIn: ["blocked", "rejected"] } },
      include: { images: true, comments: true },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json({ ok: true, items: rows.map(toPost), source: "database" });
  } catch {
    console.warn("[api/posts] database unavailable, using mock posts");
    return NextResponse.json({ ok: true, items: mockPosts, source: "mock" });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const authorId = String(body.authorId ?? "u_001");
  const moderation = moderateContent(`${String(body.title ?? "")} ${String(body.summary ?? body.content ?? "")} ${String(body.content ?? "")}`);
  if (moderation.decision === "block") {
    return NextResponse.json({ ok: false, error: "content_blocked", moderation }, { status: 400 });
  }

  try {
    await ensureCommunitySeed();
    const author = await prisma.hubUser.findUnique({ where: { id: authorId } });
    if (!author) return NextResponse.json({ ok: false, error: "author_not_found" }, { status: 404 });

    const id = `p_${Date.now()}`;
    const post = await prisma.communityPost.create({
      data: {
        id,
        title: String(body.title ?? ""),
        type: String(body.type ?? "TECH"),
        authorId: author.id,
        authorName: author.name,
        authorAvatar: author.avatar,
        category: String(body.category ?? "校园"),
        board: String(body.board ?? "综合"),
        summary: String(body.summary ?? body.content ?? "").slice(0, 140),
        content: String(body.content ?? ""),
        tags: Array.isArray(body.tags) ? body.tags.map(String) : [],
        requiredSkills: Array.isArray(body.requiredSkills) ? body.requiredSkills.map(String) : [],
        openSlots: Number(body.openSlots ?? 0),
        status: String(body.status ?? "已发布"),
        moderationStatus: moderation.decision === "allow" ? "approved" : "pending",
        reviewNote: moderation.message,
        heat: 0,
        images: {
          create: Array.isArray(body.images)
            ? body.images.map((url: unknown) => ({
                url: String(url),
                alt: String(body.title ?? "post image"),
                width: 0,
                height: 0
              }))
            : []
        }
      },
      include: { images: true, comments: true }
    });

    return NextResponse.json({ ok: true, item: toPost(post), source: "database" });
  } catch {
    console.warn("[api/posts] database unavailable, returning mock-created post");
    const author = mockUsers.find((user) => user.id === authorId) ?? mockUsers.find((user) => user.id === "u_001") ?? mockUsers[0];
    const item: Post = {
      id: `p_${Date.now()}`,
      title: String(body.title ?? ""),
      type: String(body.type ?? "TECH") as Post["type"],
      authorId: author.id,
      author: author.name,
      authorAvatar: author.avatar,
      category: String(body.category ?? "校园"),
      board: String(body.board ?? "综合"),
      summary: String(body.summary ?? body.content ?? "").slice(0, 140),
      content: String(body.content ?? ""),
      images: Array.isArray(body.images)
        ? body.images.slice(0, 4).map((url: unknown, index: number) => ({
            id: `local_image_${index}`,
            url: String(url),
            alt: String(body.title ?? "post image"),
            width: 0,
            height: 0
          }))
        : [],
      tags: Array.isArray(body.tags) ? body.tags.map(String) : [],
      requiredSkills: Array.isArray(body.requiredSkills) ? body.requiredSkills.map(String) : [],
      openSlots: Number(body.openSlots ?? 0),
      status: moderation.decision === "allow" ? "已发布" : "待审核",
      createdAt: "刚刚",
      comments: 0,
      heat: 0
    };
    return NextResponse.json({ ok: true, item, source: "mock" });
  }
}
