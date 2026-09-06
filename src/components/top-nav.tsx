"use client";

import { useState } from "react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Compass, Home, MessageCircle, Plus, Search, UserRound, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSessionStore } from "@/store/use-session-store";
import { Button } from "./ui";

const navItems: ReadonlyArray<{ href: Route; label: string; icon: typeof Home }> = [
  { href: "/", label: "首页", icon: Home },
  { href: "/colleges", label: "学院", icon: Building2 },
  { href: "/teams", label: "组队", icon: Users },
  { href: "/discover", label: "发现", icon: Compass },
  { href: "/messages", label: "消息", icon: MessageCircle },
  { href: "/login" as Route, label: "我的", icon: UserRound }
];

export function TopNav() {
  const pathname = usePathname();
  const unread = useSessionStore((state) => state.unread);
  const user = useSessionStore((state) => state.user);
  const loading = useSessionStore((state) => state.loading);
  const [logoutError, setLogoutError] = useState("");
  async function logout() {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error();
      window.location.assign("/login");
    } catch { setLogoutError("退出失败，请重试。"); }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <Image src="/jinghu-logo.png" alt="镜湖Hub" width={30} height={30} className="rounded-lg" priority />
          <div className="truncate text-sm font-black text-ink">镜湖Hub</div>
        </Link>

        <nav className="ml-1 hidden items-center gap-1 md:flex">
          {navItems.map((original) => {
            const item = original.label === "我的" ? { ...original, href: (user ? `/profile/${user.id}` : "/login") as Route } : original;
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative inline-flex h-9 items-center gap-2 rounded-lg px-2.5 text-sm font-semibold text-neutral-600 hover:bg-brand-50 hover:text-brand-700",
                  active && "bg-brand-50 text-brand-700"
                )}
              >
                <Icon size={17} />
                {item.label}
                {item.href === "/messages" && unread > 0 && (
                  <span className="absolute right-1 top-1 size-2 rounded-full bg-brand-600" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto hidden h-9 min-w-56 items-center gap-2 rounded-lg border border-line bg-paper px-3 text-sm text-neutral-500 lg:flex">
          <Search size={16} />
          搜索帖子、队友、项目
        </div>

        <div className="ml-auto flex items-center gap-2 text-sm">
          {loading ? <span role="status">加载中…</span> : user ? <>
            <Link href={`/profile/${user.id}`} className="max-w-24 truncate font-semibold">{user.name}</Link>
            <button onClick={logout} className="text-neutral-500">退出</button>
          </> : <Link href="/login" className="font-semibold text-brand-700">登录 / 注册</Link>}
          {logoutError && <span role="alert">{logoutError}</span>}
        </div>
        <Link href={user ? "/posts/new" : "/login?next=%2Fposts%2Fnew"}>
          <Button className="h-9 px-3">
            <Plus size={16} />
            发帖
          </Button>
        </Link>
      </div>
    </header>
  );
}
