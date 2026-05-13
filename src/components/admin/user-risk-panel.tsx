import { UserCog } from "lucide-react";
import { adminUserRisks } from "@/data/admin";

export function UserRiskPanel({ limit }: { limit?: number }) {
  const users = adminUserRisks
    .slice()
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, limit);

  return (
    <section className="rounded-lg border border-line bg-white p-4 shadow-subtle">
      <div className="flex items-center gap-2">
        <UserCog size={18} className="text-brand-600" />
        <h2 className="font-black">用户风险</h2>
      </div>
      <div className="mt-4 space-y-3">
        {users.map((user) => (
          <article key={user.id} className="flex items-center gap-3 rounded-lg border border-line p-3">
            <div className="grid size-9 place-items-center rounded-full bg-brand-600 text-sm font-black text-white">
              {user.name.slice(0, 1)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-black">{user.name}</div>
              <div className="mt-1 truncate text-xs text-neutral-500">
                {user.college} · 违规 {user.violationCount} · 举报 {user.reportCount}
              </div>
              {user.tags.length > 0 && <div className="mt-1 text-xs text-amber-700">{user.tags.join(" / ")}</div>}
            </div>
            <div className="text-right">
              <div className="text-sm font-black">{user.riskScore}</div>
              <div className="text-xs text-neutral-400">风险分</div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
