import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.announcement.findMany({
    orderBy: { updatedAt: "desc" }
  });
  return NextResponse.json({ ok: true, items });
}

export async function POST(request: Request) {
  const body = await request.json();
  const item = await prisma.announcement.create({
    data: {
      title: String(body.title ?? ""),
      body: String(body.body ?? ""),
      slot: String(body.slot ?? "home"),
      status: String(body.status ?? "draft"),
      imageUrl: body.imageUrl ? String(body.imageUrl) : null
    }
  });
  return NextResponse.json({ ok: true, item });
}
