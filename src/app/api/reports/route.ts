import { userAccess } from "@/lib/user-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const sessionUser = await userAccess();
  if (sessionUser instanceof NextResponse) return sessionUser;
  const items = await prisma.report.findMany({
    where: { reporterId: sessionUser.id },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json({ ok: true, items });
}

export async function POST(request: Request) {
  const sessionUser = await userAccess();
  if (sessionUser instanceof NextResponse) return sessionUser;
  const body = await request.json();
  const item = await prisma.report.create({
    data: {
      reporterId: sessionUser.id,
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
