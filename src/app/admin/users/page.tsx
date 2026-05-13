import { AdminShell } from "@/components/admin/admin-shell";
import { UserRiskPanel } from "@/components/admin/user-risk-panel";

export default function AdminUsersPage() {
  return (
    <AdminShell title="用户管理" description="把用户作为风险对象管理，查看违规次数、举报次数和风险分。">
      <div className="mt-6 max-w-4xl">
        <UserRiskPanel />
      </div>
    </AdminShell>
  );
}
