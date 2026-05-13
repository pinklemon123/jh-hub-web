import { AdminHeaderActions } from "@/components/admin/admin-actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { ModerationWorkspace } from "@/components/admin/moderation-workspace";

export default function AdminModerationPage() {
  return (
    <AdminShell title="审核中心" description="集中处理待审核、疑似违规、高风险和自动拦截内容。" actions={<AdminHeaderActions />}>
      <ModerationWorkspace />
    </AdminShell>
  );
}
