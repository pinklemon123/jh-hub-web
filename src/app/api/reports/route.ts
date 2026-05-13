import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.report.findMany({
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json({ ok: true, items });
}

export async function POST(request: Request) {
  const body = await request.json();
  const item = await prisma.report.create({
    data: {
      reporterId: String(body.reporterId ?? "u_001"),
      targetType: String(body.targetType ?? ""),
      targetId: String(body.targetId ?? ""),
      accusedName: String(body.accusedName ?? ""),
      reason: String(body.reason ?? ""),
      detail: String(body.detail ?? ""),
      snapshot: String(body.snapshot ?? ""),
      status: "open"
    }
  });
  return NextResponse.json({ ok: true, item });
}
