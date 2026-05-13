import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.systemMessage.findMany({
    where: {
      OR: [{ scope: "all" }, { targetUserId: "u_001" }]
    },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json({ ok: true, items });
}
