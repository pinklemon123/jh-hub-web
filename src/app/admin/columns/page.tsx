import { AdminShell } from "@/components/admin/admin-shell";
import { ColumnsPanel } from "@/components/admin/columns-panel";

export default function AdminColumnsPage() {
  return (
    <AdminShell title="发现运营" description="用于学校官号、校园公告、活动推送和发现页内容管理。">
      <div className="mt-6">
        <ColumnsPanel />
      </div>
    </AdminShell>
  );
}
