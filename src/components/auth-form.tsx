"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button, Card } from "@/components/ui";

export function AuthForm({ register = false }: { register?: boolean }) {
  const params = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const requested = params.get("next") ?? "/";
  const next = requested.startsWith("/") && !requested.startsWith("//") && !/[\\\u0000-\u001f]/.test(requested) && !/^\/(login|register|api)(\/|\?|$)/.test(requested) ? requested : "/";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const fields = new FormData(event.currentTarget);
    if (register && fields.get("password") !== fields.get("confirm")) { setError("两次输入的密码不一致。"); return; }
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/auth/${register ? "register" : "login"}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fields.get("email"), password: fields.get("password"), name: fields.get("name") })
      });
      const data = await response.json();
      if (!response.ok) { setError(data.message ?? "暂时无法登录，请稍后重试。"); return; }
      // Clear prior user-specific client state and query caches on account changes.
      window.location.assign(next);
    } catch { setError("网络连接失败，请稍后重试。"); }
    finally { setBusy(false); }
  }

  const inputClass = "mt-1 h-11 w-full rounded-lg border border-line bg-paper px-4 text-sm outline-none focus:border-brand-500";
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <Link href="/" className="inline-flex items-center gap-3">
          <Image src="/jinghu-logo.png" alt="镜湖 Hub" width={44} height={44} className="rounded-lg" />
          <span className="text-xl font-black">镜湖 Hub</span>
        </Link>
        <h1 className="mt-6 text-2xl font-black">{register ? "创建你的账户" : "欢迎回来"}</h1>
        <p className="mt-2 text-sm text-neutral-500">{register ? "加入社区，分享想法，找到一起做项目的同学。" : "登录后参与讨论、发布项目和联系队友。"}</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          {register && <label className="block text-sm font-semibold">昵称<input name="name" autoComplete="nickname" required minLength={2} maxLength={30} className={inputClass} placeholder="如何称呼你" /></label>}
          <label className="block text-sm font-semibold">邮箱<input name="email" type="email" autoComplete="username" required maxLength={254} className={inputClass} placeholder="you@example.com" /></label>
          <label className="block text-sm font-semibold">密码<input name="password" type="password" autoComplete={register ? "new-password" : "current-password"} required minLength={8} maxLength={128} className={inputClass} placeholder="8–128 位密码" /></label>
          {register && <label className="block text-sm font-semibold">确认密码<input name="confirm" type="password" autoComplete="new-password" required minLength={8} maxLength={128} className={inputClass} placeholder="再次输入密码" /></label>}
          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <Button type="submit" className="w-full" disabled={busy}>{busy ? "请稍候…" : register ? "注册并登录" : "登录"}</Button>
        </form>
        <p className="mt-5 text-center text-sm text-neutral-500">{register ? "已有账户？" : "还没有账户？"} <Link className="font-bold text-brand-700" href={{ pathname: register ? "/login" : "/register", query: { next } }}>{register ? "去登录" : "立即注册"}</Link></p>
        <Link href="/" className="mt-4 block text-center text-sm text-neutral-500">先逛逛社区</Link>
      </Card>
    </main>
  );
}
