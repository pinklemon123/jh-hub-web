import { NextResponse } from "next/server";
import { createAdminSession, verifyAdminPassword } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const body = await request.json();
  if (!verifyAdminPassword(String(body.password ?? ""))) {
    return NextResponse.json({ ok: false, error: "password_incorrect" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("admin_session", await createAdminSession(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8
  });
  return response;
}
