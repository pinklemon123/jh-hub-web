import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const scrypt = promisify(scryptCallback);
export const SESSION_COOKIE = "user_session";
const SESSION_SECONDS = 60 * 60 * 24 * 7;
export const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = await scrypt(password, salt, 64) as Buffer;
  return `scrypt:${salt}:${key.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string | undefined) {
  const [, salt, hash] = (stored ?? `scrypt:${"0".repeat(32)}:${"0".repeat(128)}`).split(":");
  const candidate = await scrypt(password, salt, 64) as Buffer;
  const expected = Buffer.from(hash, "hex");
  return expected.length === candidate.length && timingSafeEqual(expected, candidate) && Boolean(stored);
}

export async function getCurrentUser() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const session = await prisma.userSession.findUnique({ where: { tokenHash: tokenHash(token) }, include: { user: true } });
  return session && session.expiresAt > new Date() ? session.user : null;
}

export async function userAccess() {
  return await getCurrentUser() ?? NextResponse.json({ ok: false, error: "unauthorized", message: "请先登录后再操作。" }, { status: 401 });
}

export async function startSession(userId: string, request: Request, response: NextResponse) {
  const jar = await cookies();
  const previous = jar.get(SESSION_COOKIE)?.value;
  if (previous) await prisma.userSession.deleteMany({ where: { tokenHash: tokenHash(previous) } });
  await prisma.userSession.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  const token = randomBytes(32).toString("hex");
  await prisma.userSession.create({ data: { tokenHash: tokenHash(token), userId, expiresAt: new Date(Date.now() + SESSION_SECONDS * 1000) } });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true, sameSite: "lax", secure: new URL(request.url).protocol === "https:", path: "/", maxAge: SESSION_SECONDS
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function limitAuth(action: string, email: string) {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  await prisma.authAttempt.deleteMany({ where: { expiresAt: { lt: new Date(now) } } });
  // Database counters work across workers and do not depend on optional Redis.
  for (const [scope, limit] of [[email, 10], ["global", 200]] as const) {
    const key = tokenHash(`${action}:${scope}:${Math.floor(now / windowMs)}`);
    const row = await prisma.authAttempt.upsert({ where: { key }, create: { key, count: 1, expiresAt: new Date(now + windowMs) }, update: { count: { increment: 1 } } });
    if (row.count > limit) return false;
  }
  return true;
}

export async function credentials(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.email !== "string" || typeof body.password !== "string") return null;
  const email = body.email.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || body.password.length < 8 || body.password.length > 128) return null;
  const name: string = typeof body.name === "string" ? body.name.trim() : "";
  return { email, password: body.password as string, name };
}
