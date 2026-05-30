"use client";

import { ShieldCheck, UserCog } from "lucide-react";
import { useEffect, useState } from "react";
import { adminUserRisks } from "@/data/admin";
import type { AdminUserRisk, UserRole } from "@/types/admin";

const roleLabels: Record<UserRole, string> = {
  USER: "普通用户",
  COLLEGE_ADMIN: "学院管理员",
  SYSTEM_ADMIN: "系统管理员"
};

export function UserRiskPanel({ limit }: { limit?: number }) {
  const [users, setUsers] = useState<AdminUserRisk[]>(adminUserRisks);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);

  useEffect(() => {
    void refresh();
  }, []);

  async function refresh() {
    fetch("/api/admin/users", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { items?: AdminUserRisk[] }) => setUsers(data.items ?? []))
      .catch(() => undefined);
  }

  async function updateRole(userId: string, role: UserRole) {
    setSavingUserId(userId);
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role })
      });
      if (response.ok) {
        setUsers((current) => current.map((user) => (user.id === userId ? { ...user, role } : user)));
      }
    } finally {
      setSavingUserId(null);
    }
  }

  const visibleUsers = users
    .slice()
    .sort((a, b) => {
      if (a.role !== b.role) return roleWeight(b.role) - roleWeight(a.role);
      return b.riskScore - a.riskScore;
    })
    .slice(0, limit);

  return (
    <section className="rounded-lg border border-line bg-white p-4 shadow-subtle">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <UserCog size={18} className="text-brand-600" />
          <h2 className="font-black">用户与学院权限</h2>
        </div>
        <div className="text-xs font-semibold text-neutral-500">系统管理员可手动指定学院管理员</div>
      </div>

      <div className="mt-4 space-y-3">
        {visibleUsers.map((user) => (
          <article key={user.id} className="flex flex-col gap-3 rounded-lg border border-line p-3 lg:flex-row lg:items-center">
            <div className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-600 text-sm font-black text-white">
              {user.name.slice(0, 1)}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <div className="truncate text-sm font-black">{user.name}</div>
                <span className={roleBadgeClass(user.role)}>{roleLabels[user.role]}</span>
              </div>
              <div className="mt-1 truncate text-xs text-neutral-500">
                {user.college} · 违规 {user.violationCount} · 举报 {user.reportCount}
              </div>
              {user.tags.length > 0 && <div className="mt-1 text-xs text-amber-700">{user.tags.join(" / ")}</div>}
            </div>

            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              <div className="rounded-lg bg-paper px-3 py-2 text-right">
                <div className="text-sm font-black">{user.riskScore}</div>
                <div className="text-xs text-neutral-400">风险分</div>
              </div>
              {user.role === "SYSTEM_ADMIN" ? (
                <span className="inline-flex h-9 items-center gap-1 rounded-lg bg-neutral-950 px-3 text-xs font-bold text-white">
                  <ShieldCheck size={14} />
                  最高权限
                </span>
              ) : user.role === "COLLEGE_ADMIN" ? (
                <button
                  onClick={() => updateRole(user.id, "USER")}
                  disabled={savingUserId === user.id}
                  className="h-9 rounded-lg border border-line px-3 text-xs font-bold text-neutral-700 hover:bg-paper disabled:opacity-50"
                >
                  取消管理员
                </button>
              ) : (
                <button
                  onClick={() => updateRole(user.id, "COLLEGE_ADMIN")}
                  disabled={savingUserId === user.id}
                  className="h-9 rounded-lg bg-brand-600 px-3 text-xs font-bold text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  设为学院管理员
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function roleWeight(role: UserRole) {
  if (role === "SYSTEM_ADMIN") return 3;
  if (role === "COLLEGE_ADMIN") return 2;
  return 1;
}

function roleBadgeClass(role: UserRole) {
  const base = "rounded-full px-2 py-0.5 text-xs font-bold";
  if (role === "SYSTEM_ADMIN") return `${base} bg-neutral-950 text-white`;
  if (role === "COLLEGE_ADMIN") return `${base} bg-brand-50 text-brand-700`;
  return `${base} bg-paper text-neutral-600`;
}
