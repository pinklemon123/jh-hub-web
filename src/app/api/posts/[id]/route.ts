import { NextResponse } from "next/server";
import { ensureCommunitySeed, toPost } from "@/lib/community-db";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureCommunitySeed();
  const { id } = await params;
  const post = await prisma.communityPost.findUnique({
    where: { id },
    include: { images: true, comments: true }
  });
  if (!post || post.moderationStatus === "blocked" || post.moderationStatus === "rejected") {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, item: toPost(post) });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureCommunitySeed();
  const { id } = await params;
  const body = await request.json();
  const post = await prisma.communityPost.update({
    where: { id },
    data: {
      title: body.title === undefined ? undefined : String(body.title),
      summary: body.summary === undefined ? undefined : String(body.summary),
      content: body.content === undefined ? undefined : String(body.content),
      tags: Array.isArray(body.tags) ? body.tags.map(String) : undefined,
      requiredSkills: Array.isArray(body.requiredSkills) ? body.requiredSkills.map(String) : undefined,
      status: body.status === undefined ? undefined : String(body.status)
    },
    include: { images: true, comments: true }
  });
  return NextResponse.json({ ok: true, item: toPost(post) });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureCommunitySeed();
  const { id } = await params;
  await prisma.communityPost.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
