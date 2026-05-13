import { AdminShell } from "@/components/admin/admin-shell";
import { RulesPanel } from "@/components/admin/rules-panel";

export default function AdminRulesPage() {
  return (
    <AdminShell title="风控规则" description="管理敏感词、联系方式检测、频率风控和自动处理规则。">
      <div className="mt-6 max-w-4xl">
        <RulesPanel />
      </div>
    </AdminShell>
  );
}
