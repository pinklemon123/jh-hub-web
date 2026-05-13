import { AdminShell } from "@/components/admin/admin-shell";
import { AnnouncementsPanel } from "@/components/admin/announcements-panel";

export default function AdminAnnouncementsPage() {
  return (
    <AdminShell title="公告运营" description="管理首页公告、系统通知、活动轮播和运营内容。">
      <div className="mt-6 max-w-4xl">
        <AnnouncementsPanel />
      </div>
    </AdminShell>
  );
}
