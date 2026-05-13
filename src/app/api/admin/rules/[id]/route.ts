import { NextResponse } from "next/server";
import { ensureCommunitySeed, toAdminRule } from "@/lib/community-db";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureCommunitySeed();
  const { id } = await params;
  const body = await request.json();
  const row = await prisma.moderationRule.update({
    where: { id },
    data: {
      name: body.name === undefined ? undefined : String(body.name),
      trigger: body.trigger === undefined ? undefined : String(body.trigger),
      action: body.action === undefined ? undefined : String(body.action),
      enabled: body.enabled === undefined ? undefined : Boolean(body.enabled)
    }
  });
  return NextResponse.json({ ok: true, item: toAdminRule(row) });
}
