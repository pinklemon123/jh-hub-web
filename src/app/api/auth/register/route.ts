import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureCommunitySeed, toUser } from "@/lib/community-db";
import { credentials, hashPassword, limitAuth, startSession } from "@/lib/user-auth";

export async function POST(request: Request) {
  const input = await credentials(request);
  if (!input || input.name.length < 2 || input.name.length > 30) return NextResponse.json({ ok: false, message: "请填写有效邮箱、2–30 字昵称和 8–128 位密码。" }, { status: 400 });
  if (!await limitAuth("register", input.email)) return NextResponse.json({ ok: false, message: "注册尝试过于频繁，请 15 分钟后再试。" }, { status: 429 });
  await ensureCommunitySeed();
  const passwordHash = await hashPassword(input.password);
  try {
    const user = await prisma.hubUser.create({ data: {
      id: `u_${randomUUID()}`, name: input.name, realName: "", college: "未填写学院", grade: "未填写年级", direction: "", avatar: Array.from(input.name)[0], bio: "", contact: "", status: "新同学", online: false, skills: [],
      account: { create: { email: input.email, passwordHash } }
    } });
    return startSession(user.id, request, NextResponse.json({ ok: true, user: toUser(user) }, { status: 201 }));
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") return NextResponse.json({ ok: false, message: "该邮箱已注册，请直接登录。" }, { status: 409 });
    throw error;
  }
}
