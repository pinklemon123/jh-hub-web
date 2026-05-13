"use client";

import { useEffect, useMemo, useState } from "react";
import { adminAuditLogs, adminQueue } from "@/data/admin";
import type { AdminContentType, AdminQueueItem } from "@/types/admin";
import { AuditLogPanel } from "./audit-log-panel";
import { ModerationDetail } from "./moderation-detail";
import { ModerationTable } from "./moderation-table";
import { ReportsPanel } from "./reports-panel";
import { RulesPanel } from "./rules-panel";
import { UserRiskPanel } from "./user-risk-panel";

export function ModerationWorkspace({ compact = false }: { compact?: boolean }) {
  const [filter, setFilter] = useState<AdminContentType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "blocked" | "rejected">("all");
  const [query, setQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<AdminQueueItem | null>(adminQueue[0] ?? null);
  const [sourceItems, setSourceItems] = useState<AdminQueueItem[]>(adminQueue);
  const [logs, setLogs] = useState(adminAuditLogs);

  useEffect(() => {
    fetch("/api/admin/moderation")
      .then((response) => response.json())
      .then((data: { items?: AdminQueueItem[] }) => {
        const items = data.items ?? [];
        setSourceItems(items);
        setSelectedItem(items[0] ?? null);
      })
      .catch(() => undefined);
  }, []);

  const queue = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return sourceItems.filter((item) => {
      const typeMatched = filter === "all" || item.type === filter;
      const statusMatched = statusFilter === "all" || item.moderationStatus === statusFilter;
      const queryMatched =
        !normalizedQuery ||
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.content.toLowerCase().includes(normalizedQuery) ||
        item.authorName.toLowerCase().includes(normalizedQuery);

      return typeMatched && statusMatched && queryMatched;
    });
  }, [filter, query, sourceItems, statusFilter]);

  async function recordAction(action: string, item: AdminQueueItem | null = selectedItem) {
    if (!item) return;
    const response = await fetch("/api/admin/moderation/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, type: item.type, action })
    });
    const data = (await response.json()) as { item?: AdminQueueItem | null };
    if (data.item) {
      setSourceItems((current) => current.map((currentItem) => (currentItem.id === item.id && currentItem.type === item.type ? data.item! : currentItem)));
      setSelectedItem(data.item);
    }
    setLogs((current) => [
      {
        id: `log_${Date.now()}`,
        admin: "admin01",
        action: actionLabel(action),
        target: item.id,
        reason: item.moderation.message,
        createdAt: "刚刚"
      },
      ...current
    ]);
  }

  return (
    <section className="mt-6 grid gap-5 xl:grid-cols-[1fr_360px]">
      <ModerationTable
        queue={queue}
        filter={filter}
        statusFilter={statusFilter}
        query={query}
        onFilterChange={setFilter}
        onStatusFilterChange={setStatusFilter}
        onQueryChange={setQuery}
        onSelect={setSelectedItem}
        onAction={recordAction}
      />

      <div className="space-y-5">
        <ModerationDetail item={selectedItem} onAction={recordAction} />
        {!compact && <RulesPanel />}
        <ReportsPanel limit={compact ? 3 : undefined} />
        <UserRiskPanel limit={compact ? 4 : undefined} />
        <AuditLogPanel logs={logs} limit={compact ? 5 : undefined} />
      </div>
    </section>
  );
}

function actionLabel(action: string) {
  if (action === "approve") return "通过内容";
  if (action === "block") return "拦截内容";
  if (action === "reject") return "删除/隐藏内容";
  if (action === "warn") return "警告用户";
  if (action === "mute") return "禁言用户";
  return action;
}
