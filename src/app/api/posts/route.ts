import { NextResponse } from "next/server";
import { ensureCommunitySeed, toPost } from "@/lib/community-db";
import { moderateContent } from "@/lib/moderation";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await ensureCommunitySeed();
  const rows = await prisma.communityPost.findMany({
    where: { moderationStatus: { notIn: ["blocked", "rejected"] } },
    include: { images: true, comments: true },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json({ ok: true, items: rows.map(toPost) });
}

export async function POST(request: Request) {
  await ensureCommunitySeed();
  const body = await request.json();
  const authorId = String(body.authorId ?? "u_001");
  const author = await prisma.hubUser.findUnique({ where: { id: authorId } });
  if (!author) return NextResponse.json({ ok: false, error: "author_not_found" }, { status: 404 });

  const id = `p_${Date.now()}`;
  const moderation = moderateContent(`${String(body.title ?? "")} ${String(body.summary ?? body.content ?? "")} ${String(body.content ?? "")}`);
  if (moderation.decision === "block") {
    return NextResponse.json({ ok: false, error: "content_blocked", moderation }, { status: 400 });
  }

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

  return NextResponse.json({ ok: true, item: toPost(post) });
}
