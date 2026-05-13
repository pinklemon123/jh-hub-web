import { NextResponse } from "next/server";
import { ensureCommunitySeed, toAdminRule } from "@/lib/community-db";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await ensureCommunitySeed();
  const rows = await prisma.moderationRule.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json({ ok: true, items: rows.map(toAdminRule) });
}

export async function POST(request: Request) {
  await ensureCommunitySeed();
  const body = await request.json();
  const row = await prisma.moderationRule.create({
    data: {
      id: String(body.id ?? `rule_${Date.now()}`),
      name: String(body.name ?? ""),
      trigger: String(body.trigger ?? ""),
      action: String(body.action ?? ""),
      enabled: Boolean(body.enabled ?? true)
    }
  });
  return NextResponse.json({ ok: true, item: toAdminRule(row) });
}
