import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.systemMessage.findMany({
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json({ ok: true, items });
}

export async function POST(request: Request) {
  const body = await request.json();
  const item = await prisma.systemMessage.create({
    data: {
      scope: String(body.scope ?? "user"),
      targetUserId: body.targetUserId ? String(body.targetUserId) : null,
      targetName: String(body.targetName ?? ""),
      title: String(body.title ?? ""),
      body: String(body.body ?? ""),
      messageType: String(body.messageType ?? "warning"),
      createdBy: String(body.createdBy ?? "admin01")
    }
  });
  return NextResponse.json({ ok: true, item });
}
