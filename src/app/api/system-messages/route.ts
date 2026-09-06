import { userAccess } from "@/lib/user-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const sessionUser = await userAccess();
  if (sessionUser instanceof NextResponse) return sessionUser;
  const items = await prisma.systemMessage.findMany({
    where: {
      OR: [{ scope: "all" }, { targetUserId: sessionUser.id }]
    },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json({ ok: true, items });
}
