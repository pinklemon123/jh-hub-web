import { AdminShell } from "@/components/admin/admin-shell";
import { ColumnsPanel } from "@/components/admin/columns-panel";

export default function AdminColumnsPage() {
  return (
    <AdminShell title="专栏编辑" description="用于运营推送、专题内容、首页专栏和活动策划内容管理。">
      <div className="mt-6">
        <ColumnsPanel />
      </div>
    </AdminShell>
  );
}
