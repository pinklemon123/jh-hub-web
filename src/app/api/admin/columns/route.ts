import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.editorialColumn.findMany({
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }]
  });
  return NextResponse.json({ ok: true, items });
}

export async function POST(request: Request) {
  const body = await request.json();
  const item = await prisma.editorialColumn.create({
    data: {
      title: String(body.title ?? ""),
      summary: String(body.summary ?? ""),
      content: String(body.content ?? ""),
      coverUrl: body.coverUrl ? String(body.coverUrl) : null,
      status: String(body.status ?? "draft"),
      sortOrder: Number(body.sortOrder ?? 0)
    }
  });
  return NextResponse.json({ ok: true, item });
}
