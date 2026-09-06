import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toUser } from "@/lib/community-db";
import { credentials, limitAuth, startSession, verifyPassword } from "@/lib/user-auth";

export async function POST(request: Request) {
  const input = await credentials(request);
  if (!input) return NextResponse.json({ ok: false, message: "请填写有效邮箱和 8–128 位密码。" }, { status: 400 });
  if (!await limitAuth("login", input.email)) return NextResponse.json({ ok: false, message: "登录尝试过于频繁，请 15 分钟后再试。" }, { status: 429 });
  const account = await prisma.userAccount.findUnique({ where: { email: input.email }, include: { user: true } });
  if (!await verifyPassword(input.password, account?.passwordHash) || !account) return NextResponse.json({ ok: false, message: "邮箱或密码错误。" }, { status: 401 });
  return startSession(account.userId, request, NextResponse.json({ ok: true, user: toUser(account.user) }));
}
