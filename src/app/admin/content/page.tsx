import { AdminShell } from "@/components/admin/admin-shell";
import { ContentManagementPanel } from "@/components/admin/content-management-panel";

export default function AdminContentPage() {
  return (
    <AdminShell title="内容管理" description="管理帖子、评论、私信、图片的展示状态和运营动作。">
      <div className="mt-6">
        <ContentManagementPanel />
      </div>
    </AdminShell>
  );
}
