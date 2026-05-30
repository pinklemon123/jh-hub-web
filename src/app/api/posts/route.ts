import { NextResponse } from "next/server";
import { posts as mockPosts } from "@/data/mock";
import { ensureCommunitySeed, toPost } from "@/lib/community-db";
import { moderateContent } from "@/lib/moderation";
import { clearPostsCache, getCachedPosts, setCachedPosts } from "@/lib/posts-cache";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cachedPosts = await getCachedPosts();
    if (cachedPosts) {
      console.log("[api/posts] 走 Redis 缓存");
      return NextResponse.json({ ok: true, items: cachedPosts, source: "redis" });
    }

    console.log("[api/posts] 走 PostgreSQL 数据库");
    await ensureCommunitySeed();
    const rows = await prisma.communityPost.findMany({
      where: { moderationStatus: "approved" },
      include: { images: true, comments: true },
      orderBy: { createdAt: "desc" }
    });
    const items = rows.map(toPost);
    await setCachedPosts(items);
    return NextResponse.json({ ok: true, items, source: "database" });
  } catch (error) {
    console.warn("[api/posts] database unavailable, using mock posts", error);
    return NextResponse.json({ ok: true, items: mockPosts, source: "mock" });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const authorId = String(body.authorId ?? "u_001");
  const moderation = moderateContent(`${String(body.title ?? "")} ${String(body.summary ?? body.content ?? "")} ${String(body.content ?? "")}`);
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
        moderationStatus: moderation.decision === "block" ? "blocked" : "pending",
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

    if (moderation.decision === "block") {
      return NextResponse.json({ ok: false, error: "content_blocked", item: toPost(post), moderation, source: "database" }, { status: 400 });
    }

    await clearPostsCache();
    return NextResponse.json({ ok: true, item: toPost(post), source: "database" });
  } catch (error) {
    console.warn("[api/posts] database unavailable, post was not saved", error);
    return NextResponse.json({ ok: false, error: "database_unavailable", message: "数据库未连接，发帖没有保存到审核后台。" }, { status: 503 });
  }
}
