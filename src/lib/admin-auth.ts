import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const encoder = new TextEncoder();

export function verifyAdminPassword(password: string) {
  const stored = process.env.ADMIN_PASSWORD_HASH;
  if (!stored) return false;
  const [algorithm, salt, hash] = stored.split(":");
  if (algorithm !== "scrypt" || !salt || !hash) return false;
  const actual = Buffer.from(hash, "hex");
  const candidate = scryptSync(password, salt, actual.length);
  return actual.length === candidate.length && timingSafeEqual(actual, candidate);
}

export async function createAdminSession() {
  const expires = Date.now() + 8 * 60 * 60 * 1000;
  const nonce = randomBytes(12).toString("hex");
  const payload = `${expires}.${nonce}`;
  const signature = await hmac(payload);
  return `${payload}.${signature}`;
}

export async function verifyAdminSession(token: string | undefined) {
  if (!token) return false;
  const [expiresRaw, nonce, signature] = token.split(".");
  const expires = Number(expiresRaw);
  if (!expiresRaw || !nonce || !signature || !Number.isFinite(expires) || expires < Date.now()) return false;
  const expected = await hmac(`${expiresRaw}.${nonce}`);
  return constantTimeStringEqual(signature, expected);
}

async function hmac(payload: string) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return "";
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return Buffer.from(signature).toString("hex");
}

function constantTimeStringEqual(a: string, b: string) {
  const aHash = createHash("sha256").update(a).digest();
  const bHash = createHash("sha256").update(b).digest();
  return timingSafeEqual(aHash, bHash);
}
