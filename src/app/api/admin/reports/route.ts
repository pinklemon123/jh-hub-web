import { NextResponse } from "next/server";
import { moderateContent } from "@/lib/moderation";
import { prisma } from "@/lib/prisma";
import type { AdminReport } from "@/types/admin";

export async function GET() {
  const rows = await prisma.report.findMany({ orderBy: { createdAt: "desc" } });
  const items: AdminReport[] = rows.map((report) => {
    const moderation = moderateContent(`${report.reason} ${report.detail} ${report.snapshot}`);
    return {
      id: report.id,
      targetType: report.targetType as AdminReport["targetType"],
      targetId: report.targetId,
      reporter: report.reporterId,
      accused: report.accusedName,
      reason: report.reason,
      snapshot: report.snapshot,
      createdAt: report.createdAt.toLocaleString("zh-CN"),
      status: report.status as AdminReport["status"],
      risk: moderation.level
    };
  });
  return NextResponse.json({ ok: true, items });
}
