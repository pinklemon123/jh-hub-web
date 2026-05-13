"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";
import { useState } from "react";
import { Button, Card } from "@/components/ui";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    setLoading(true);
    setError("");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });
    setLoading(false);

    if (!response.ok) {
      setError("管理员密码不正确");
      return;
    }

    router.replace((searchParams.get("next") || "/admin") as Route);
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md p-6">
      <div className="text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-lg bg-brand-600 text-lg font-black text-white">镜</div>
        <h1 className="mt-4 text-2xl font-black">镜湖 Hub 管理员登录</h1>
        <p className="mt-2 text-sm text-neutral-500">输入管理员密码后才能访问后台。</p>
      </div>
      <div className="mt-6 space-y-3">
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") login();
          }}
          type="password"
          className="h-11 w-full rounded-lg border border-line px-3 text-sm outline-none focus:border-brand-500"
          placeholder="管理员密码"
          autoFocus
        />
        {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</div>}
        <Button onClick={login} disabled={loading} className="w-full">
          {loading ? "登录中" : "登录后台"}
        </Button>
      </div>
    </Card>
  );
}
