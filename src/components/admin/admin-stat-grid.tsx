"use client";

import { Bell, Flag, Gavel, ShieldCheck, Siren, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { adminOverview } from "@/data/admin";
import type { AdminOverview } from "@/types/admin";

const statDefs = [
  { label: "今日新增用户", key: "newUsersToday", icon: Users },
  { label: "今日发帖", key: "postsToday", icon: Bell },
  { label: "举报待处理", key: "reportCount", icon: Flag },
  { label: "风险内容", key: "riskyContent", icon: Siren },
  { label: "待人工审核", key: "pendingReview", icon: Gavel },
  { label: "自动拦截", key: "blockedContent", icon: ShieldCheck }
] as const;

export function AdminStatGrid() {
  const [overview, setOverview] = useState<AdminOverview>(adminOverview);

  useEffect(() => {
    fetch("/api/admin/overview", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { item?: AdminOverview }) => {
        if (data.item) setOverview(data.item);
      })
      .catch(() => undefined);
  }, []);

  return (
    <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
      {statDefs.map((stat) => {
        const Icon = stat.icon;

        return (
          <article key={stat.label} className="rounded-lg border border-line bg-white p-4 shadow-subtle">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-neutral-500">{stat.label}</span>
              <Icon size={16} className="text-brand-600" />
            </div>
            <div className="mt-4 text-3xl font-black">{overview[stat.key]}</div>
          </article>
        );
      })}
    </section>
  );
}
