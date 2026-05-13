import { Bell, Flag, Gavel, ShieldCheck, Siren, Users } from "lucide-react";
import { adminOverview } from "@/data/admin";

const statCards = [
  { label: "今日新增用户", value: adminOverview.newUsersToday, icon: Users },
  { label: "今日发帖", value: adminOverview.postsToday, icon: Bell },
  { label: "举报待处理", value: adminOverview.reportCount, icon: Flag },
  { label: "风险内容", value: adminOverview.riskyContent, icon: Siren },
  { label: "待人工审核", value: adminOverview.pendingReview, icon: Gavel },
  { label: "自动拦截", value: adminOverview.blockedContent, icon: ShieldCheck }
];

export function AdminStatGrid() {
  return (
    <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
      {statCards.map((stat) => {
        const Icon = stat.icon;

        return (
          <article key={stat.label} className="rounded-lg border border-line bg-white p-4 shadow-subtle">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-neutral-500">{stat.label}</span>
              <Icon size={16} className="text-brand-600" />
            </div>
            <div className="mt-4 text-3xl font-black">{stat.value}</div>
          </article>
        );
      })}
    </section>
  );
}
