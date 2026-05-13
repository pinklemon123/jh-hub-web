import { NextResponse } from "next/server";
import { ensureCommunitySeed, toAuditLog } from "@/lib/community-db";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await ensureCommunitySeed();
  const rows = await prisma.adminAuditLog.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ ok: true, items: rows.map(toAuditLog) });
}
