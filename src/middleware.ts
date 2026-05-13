import { NextResponse, type NextRequest } from "next/server";

const encoder = new TextEncoder();

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login" || pathname === "/api/admin/login" || pathname === "/api/admin/logout") {
    return NextResponse.next();
  }

  const authed = await verifySession(request.cookies.get("admin_session")?.value);
  if (authed) return NextResponse.next();

  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

async function verifySession(token: string | undefined) {
  if (!token) return false;
  const [expiresRaw, nonce, signature] = token.split(".");
  const expires = Number(expiresRaw);
  if (!expiresRaw || !nonce || !signature || !Number.isFinite(expires) || expires < Date.now()) return false;
  const expected = await hmac(`${expiresRaw}.${nonce}`);
  return safeEqual(signature, expected);
}

async function hmac(payload: string) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return "";
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) {
    mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return mismatch === 0;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"]
};
