"use client";

import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Home, MessageCircle, Plus, Search, UserRound, Users } from "lucide-react";
import { Button } from "./ui";
import { cn } from "@/lib/utils";
import { useSessionStore } from "@/store/use-session-store";

const navItems: ReadonlyArray<{ href: Route; label: string; icon: typeof Home }> = [
  { href: "/", label: "首页", icon: Home },
  { href: "/teams", label: "组队", icon: Users },
  { href: "/discover", label: "发现", icon: Compass },
  { href: "/messages", label: "消息", icon: MessageCircle },
  { href: "/profile/u_001" as Route, label: "个人主页", icon: UserRound }
];

export function TopNav() {
  const pathname = usePathname();
  const unread = useSessionStore((state) => state.unread);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/92 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/jinghu-logo.png" alt="镜湖 Hub" width={34} height={34} className="rounded-lg" priority />
          <div className="leading-tight">
            <div className="text-sm font-black text-ink">镜湖 Hub</div>
            <div className="text-xs text-neutral-500">校园技术协作</div>
          </div>
        </Link>

        <nav className="ml-2 hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-neutral-600 hover:bg-brand-50 hover:text-brand-700",
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

        <div className="ml-auto hidden h-10 min-w-64 items-center gap-2 rounded-lg border border-line bg-paper px-3 text-sm text-neutral-500 lg:flex">
          <Search size={16} />
          搜索帖子、同学、项目
        </div>

        <Link href="/posts/new">
          <Button>
            <Plus size={16} />
            发帖
          </Button>
        </Link>
      </div>
    </header>
  );
}
