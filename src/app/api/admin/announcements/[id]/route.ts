import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const item = await prisma.announcement.update({
    where: { id },
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
