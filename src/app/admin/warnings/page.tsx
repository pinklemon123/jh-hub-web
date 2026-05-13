import { AdminShell } from "@/components/admin/admin-shell";
import { WarningMessagePanel } from "@/components/admin/warning-message-panel";

export default function AdminWarningsPage() {
  return (
    <AdminShell title="警告私信" description="向全体用户或指定用户发送系统警告私信，并保留发送记录。">
      <div className="mt-6">
        <WarningMessagePanel />
      </div>
    </AdminShell>
  );
}
