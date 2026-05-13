"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Eye, Flag, LogOut, Megaphone, MessageSquareWarning, Newspaper, ScrollText, ShieldAlert, ShieldCheck, UserCog } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const navItems: ReadonlyArray<{ href: Route; label: string; icon: typeof Activity }> = [
  { href: "/admin", label: "仪表盘", icon: Activity },
  { href: "/admin/content", label: "内容管理", icon: Eye },
  { href: "/admin/moderation", label: "审核中心", icon: ShieldAlert },
  { href: "/admin/reports", label: "举报中心", icon: Flag },
  { href: "/admin/users", label: "用户管理", icon: UserCog },
  { href: "/admin/warnings", label: "警告私信", icon: MessageSquareWarning },
  { href: "/admin/columns", label: "发现运营", icon: Newspaper },
  { href: "/admin/rules", label: "风控规则", icon: ShieldCheck },
  { href: "/admin/logs", label: "审核日志", icon: ScrollText },
  { href: "/admin/announcements", label: "公告运营", icon: Megaphone }
];

export function AdminShell({
  title,
  description,
  actions,
  children
}: {
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <div className="min-h-screen bg-[#f7f7f8] text-neutral-950">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="bg-neutral-950 px-4 py-5 text-white">
          <Link href="/admin" className="flex items-center gap-3 px-2">
            <div className="grid size-10 place-items-center rounded-lg bg-brand-600 font-black">镜</div>
            <div>
              <div className="text-sm font-black">镜湖 Hub 管理中心</div>
              <div className="text-xs text-white/55">审核 / 风控 / 运营</div>
            </div>
          </Link>

          <nav className="mt-8 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));

              return (
                <Link
                  key={`${item.href}-${item.label}`}
                  href={item.href}
                  className={cn(
                    "flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white",
                    active && "bg-white text-neutral-950 hover:bg-white hover:text-neutral-950"
                  )}
                >
                  <Icon size={17} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="text-xs font-bold text-white/50">当前策略</div>
            <div className="mt-2 text-sm font-black">规则 + 敏感词 + 风险评分</div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-md bg-white/10 py-2">低风险发布</div>
              <div className="rounded-md bg-white/10 py-2">中风险审核</div>
              <div className="rounded-md bg-white/10 py-2">高风险拦截</div>
            </div>
          </div>

          <button
            onClick={logout}
            className="mt-4 flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold text-white/55 hover:bg-white/10 hover:text-white"
          >
            <LogOut size={17} />
            退出登录
          </button>
        </aside>

        <main className="min-w-0 px-4 py-5 sm:px-6 lg:px-8">
          <header className="flex flex-col gap-4 border-b border-line pb-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-normal">{title}</h1>
              <p className="mt-1 text-sm text-neutral-500">{description}</p>
            </div>
            {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
