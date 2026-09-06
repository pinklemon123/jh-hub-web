import assert from "node:assert/strict";
import { randomUUID, createHash } from "node:crypto";
import pg from "pg";
import Redis from "ioredis";

// Run against this project's local database and a running build:
// node --env-file=.env tests/auth.integration.mjs
const base = process.env.TEST_BASE_URL ?? "http://127.0.0.1:3000";
const db = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const suffix = randomUUID();
const ids = [];
const emails = [];
const password = `Test-${randomUUID()}`;
async function call(path, { method = "GET", cookie, body, origin } = {}) {
  const response = await fetch(base + path, {
    method, redirect: "manual",
    headers: { ...(cookie ? { cookie } : {}), ...(body ? { "Content-Type": "application/json" } : {}), ...(origin ? { origin } : {}) },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await response.text();
  let data; try { data = JSON.parse(text); } catch { data = text; }
  return { status: response.status, data, cookie: response.headers.get("set-cookie")?.split(";")[0], headers: response.headers };
}

try {
  for (const path of ["/login", "/register"]) assert.equal((await call(path)).status, 200);
  for (const path of ["/api/messages", "/api/system-messages", "/api/reports"]) assert.equal((await call(path)).status, 401);
  for (const path of ["/api/posts", "/api/teams", "/api/reports", "/api/uploads/images", "/api/posts/p_001/comments"]) assert.equal((await call(path, { method: "POST", body: {} })).status, 401);
  assert.equal((await call("/posts/new")).status, 307);
  assert.equal((await call("/api/auth/register", { method: "POST", body: { email: "bad", password: "123", name: "Test" } })).status, 400);
  const accounts = [];
  for (const name of ["Alpha", "Beta", "Gamma"]) {
    const email = `auth-${suffix}-${name.toLowerCase()}@example.test`;
    emails.push(email);
    const response = await call("/api/auth/register", { method: "POST", origin: base, body: { name, email, password } });
    assert.equal(response.status, 201, JSON.stringify(response.data));
    ids.push(response.data.user.id);
    assert.ok(response.headers.get("set-cookie").includes("HttpOnly"));
    assert.ok(response.headers.get("set-cookie").includes("SameSite=lax"));
    assert.equal(response.data.user.passwordHash, undefined);
    assert.equal((await call("/api/auth/me", { cookie: response.cookie })).data.user.id, response.data.user.id);
    accounts.push({ ...response.data.user, cookie: response.cookie, email });
  }
  const [a, b, c] = accounts;
  const stored = (await db.query('SELECT password_hash FROM user_accounts WHERE user_id = $1', [a.id])).rows[0].password_hash;
  assert.ok(stored.startsWith("scrypt:")); assert.notEqual(stored, password);
  assert.equal((await call("/api/auth/register", { method: "POST", body: { name: "Duplicate", email: a.email.toUpperCase(), password } })).status, 409);
  assert.equal((await call("/api/auth/login", { method: "POST", body: { email: a.email, password: "wrong-password" } })).status, 401);
  const login = await call("/api/auth/login", { method: "POST", body: { email: a.email.toUpperCase(), password } });
  assert.equal(login.status, 200);
  const forged = await call("/api/posts", { method: "POST", cookie: a.cookie, body: { authorId: b.id, title: "Authentication test", content: "Test project discussion" } });
  assert.equal(forged.status, 200); assert.equal(forged.data.item.authorId, a.id);
  assert.equal((await call(`/api/users/${b.id}`, { method: "PATCH", cookie: a.cookie, body: { name: "Intruder" } })).status, 403);
  assert.equal((await call(`/api/users/${a.id}`, { method: "PATCH", cookie: a.cookie, body: { bio: "Updated profile" } })).status, 200);
  const message = await call("/api/messages", { method: "POST", cookie: a.cookie, body: { senderId: c.id, receiverId: b.id, content: "你好，一起学习吗？" } });
  assert.equal(message.status, 200, JSON.stringify(message.data)); assert.equal(message.data.item.senderId, a.id);
  const inbox = await call(`/api/messages?userId=${c.id}`, { cookie: b.cookie });
  assert.ok(inbox.data.items.some(item => item.id === message.data.item.id));
  const unrelated = await call(`/api/messages?userId=${a.id}`, { cookie: c.cookie });
  assert.deepEqual(unrelated.data.items, []);
  const cached = await call(`/api/messages?userId=${a.id}`, { cookie: c.cookie });
  assert.deepEqual(cached.data.items, []);
  assert.equal((await call("/api/auth/logout", { method: "POST", cookie: a.cookie, origin: "https://example.invalid" })).status, 403);
  const expiredHash = createHash("sha256").update(c.cookie.split("=")[1]).digest("hex");
  await db.query('UPDATE user_sessions SET expires_at = (NOW() AT TIME ZONE \'UTC\') - INTERVAL \'1 minute\' WHERE token_hash = $1', [expiredHash]);
  assert.equal((await call("/api/auth/me", { cookie: c.cookie })).data.user, null);
  assert.equal((await call("/api/messages", { cookie: c.cookie })).status, 401);
  assert.equal((await call("/api/auth/logout", { method: "POST", cookie: login.cookie })).status, 200);
  assert.equal((await call("/api/auth/me", { cookie: login.cookie })).data.user, null);
  assert.equal((await call("/api/posts", { method: "POST", cookie: login.cookie, body: {} })).status, 401);
  assert.equal((await call("/api/auth/me", { cookie: "user_session=" + "0".repeat(64) })).data.user, null);
  let limited;
  for (let index = 0; index < 11; index++) limited = await call("/api/auth/login", { method: "POST", body: { email: b.email, password: "incorrect-password" } });
  assert.equal(limited.status, 429);
  console.log("PASS: registration, duplicate/invalid input, password hashing, login, cookies, author identity, profile ownership, private-message isolation/cache, CSRF, session expiry/revocation, rate limits.");
} finally {
  if (ids.length) {
    await db.query('DELETE FROM reports WHERE reporter_id = ANY($1::text[])', [ids]);
    await db.query('DELETE FROM team_projects WHERE leader_id = ANY($1::text[])', [ids]);
    await db.query('DELETE FROM direct_messages WHERE sender_id = ANY($1::text[]) OR receiver_id = ANY($1::text[])', [ids]);
    await db.query('DELETE FROM community_posts WHERE author_id = ANY($1::text[])', [ids]);
    await db.query('DELETE FROM hub_users WHERE id = ANY($1::text[])', [ids]);
    const redis = new Redis(process.env.REDIS_URL ?? "redis://127.0.0.1:6379", { retryStrategy: () => null });
    redis.on("error", () => {});
    try { await redis.del(...ids.map(id => `messages:v2:${id}`)); } finally { redis.disconnect(); }
  }
  await db.end();
}
