import { NextResponse } from "next/server";
import { ensureCommunitySeed, toUser } from "@/lib/community-db";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureCommunitySeed();
  const { id } = await params;
  const user = await prisma.hubUser.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true, item: toUser(user) });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureCommunitySeed();
  const { id } = await params;
  const body = await request.json();
  const user = await prisma.hubUser.update({
    where: { id },
    data: {
      name: body.name === undefined ? undefined : String(body.name),
      bio: body.bio === undefined ? undefined : String(body.bio),
      college: body.college === undefined ? undefined : String(body.college),
      contact: body.contact === undefined ? undefined : String(body.contact),
      skills: Array.isArray(body.skills) ? body.skills.map(String) : undefined,
      direction: body.direction === undefined ? undefined : String(body.direction),
      status: body.status === undefined ? undefined : String(body.status)
    }
  });
  return NextResponse.json({ ok: true, item: toUser(user) });
}
