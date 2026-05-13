import { Activity } from "lucide-react";
import { adminAuditLogs } from "@/data/admin";

export type AuditLogItem = (typeof adminAuditLogs)[number];

export function AuditLogPanel({ logs = adminAuditLogs, limit }: { logs?: AuditLogItem[]; limit?: number }) {
  const items = typeof limit === "number" ? logs.slice(0, limit) : logs;

  return (
    <section className="rounded-lg border border-line bg-white p-4 shadow-subtle">
      <div className="flex items-center gap-2">
        <Activity size={18} className="text-brand-600" />
        <h2 className="font-black">审核日志</h2>
      </div>
      <div className="mt-4 space-y-3">
        {items.map((log) => (
          <article key={log.id} className="rounded-lg border border-line p-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="font-black">{log.action}</span>
              <span className="text-xs text-neutral-400">{log.createdAt}</span>
            </div>
            <div className="mt-1 text-neutral-500">
              {log.admin} · {log.target} · {log.reason}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
