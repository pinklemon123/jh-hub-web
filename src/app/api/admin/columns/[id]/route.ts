import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const item = await prisma.editorialColumn.update({
    where: { id },
    data: {
      title: body.title === undefined ? undefined : String(body.title),
      summary: body.summary === undefined ? undefined : String(body.summary),
      content: body.content === undefined ? undefined : String(body.content),
      coverUrl: body.coverUrl === undefined ? undefined : body.coverUrl ? String(body.coverUrl) : null,
      status: body.status === undefined ? undefined : String(body.status),
      sortOrder: body.sortOrder === undefined ? undefined : Number(body.sortOrder)
    }
  });
  return NextResponse.json({ ok: true, item });
}
