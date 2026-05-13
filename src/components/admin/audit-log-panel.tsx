"use client";

import { Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { adminAuditLogs } from "@/data/admin";
import type { AdminAuditLog } from "@/types/admin";

export type AuditLogItem = AdminAuditLog;

export function AuditLogPanel({ logs, limit }: { logs?: AuditLogItem[]; limit?: number }) {
  const [dbLogs, setDbLogs] = useState<AuditLogItem[]>(logs ?? adminAuditLogs);

  useEffect(() => {
    if (logs) return;
    fetch("/api/admin/logs", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { items?: AuditLogItem[] }) => setDbLogs(data.items ?? []))
      .catch(() => undefined);
  }, [logs]);

  const items = typeof limit === "number" ? dbLogs.slice(0, limit) : dbLogs;

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
