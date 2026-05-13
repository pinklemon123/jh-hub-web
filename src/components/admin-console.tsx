import { AdminHeaderActions } from "@/components/admin/admin-actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminStatGrid } from "@/components/admin/admin-stat-grid";
import { DashboardTrends } from "@/components/admin/dashboard-trends";
import { ModerationWorkspace } from "@/components/admin/moderation-workspace";

export function AdminConsole() {
  return (
    <AdminShell
      title="社区风控工作台"
      description="统一处理帖子、评论、私信、图片、举报和用户风险。"
      actions={<AdminHeaderActions />}
    >
      <AdminStatGrid />
      <DashboardTrends />
      <ModerationWorkspace compact />
    </AdminShell>
  );
}
