import { AdminShell } from "@/components/admin/admin-shell";
import { ReportsPanel } from "@/components/admin/reports-panel";

export default function AdminReportsPage() {
  return (
    <AdminShell title="举报中心" description="查看举报人、被举报对象、原始内容、原因和处理状态。">
      <div className="mt-6 max-w-4xl">
        <ReportsPanel />
      </div>
    </AdminShell>
  );
}
