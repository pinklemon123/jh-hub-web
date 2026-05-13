import { NextResponse } from "next/server";
import { ensureCommunitySeed, toUser } from "@/lib/community-db";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await ensureCommunitySeed();
  const rows = await prisma.hubUser.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json({ ok: true, items: rows.map(toUser) });
}
