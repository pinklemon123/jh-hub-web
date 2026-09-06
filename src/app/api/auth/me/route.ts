import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/user-auth";
import { toUser } from "@/lib/community-db";

export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json({ ok: true, user: user ? toUser(user) : null }, { headers: { "Cache-Control": "no-store" } });
}
