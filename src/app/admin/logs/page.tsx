import { AdminShell } from "@/components/admin/admin-shell";
import { AuditLogPanel } from "@/components/admin/audit-log-panel";

export default function AdminLogsPage() {
  return (
    <AdminShell title="审核日志" description="记录管理员在后台做过的处理动作、原因、目标和时间。">
      <div className="mt-6 max-w-4xl">
        <AuditLogPanel />
      </div>
    </AdminShell>
  );
}
