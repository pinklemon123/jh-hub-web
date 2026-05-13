"use client";

import type { Route } from "next";
import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { adminQueue } from "@/data/admin";
import { cn } from "@/lib/utils";
import type { AdminContentType, AdminQueueItem, ContentModerationStatus } from "@/types/admin";
import { contentTypeLabel, levelClass, levelLabel } from "./admin-labels";

const typeFilters: ReadonlyArray<{ label: string; value: AdminContentType | "all" }> = [
  { label: "全部", value: "all" },
  { label: "帖子", value: "post" },
  { label: "评论", value: "comment" },
  { label: "私信", value: "message" },
  { label: "图片", value: "image" }
];

const statusFilters: ReadonlyArray<{ label: string; value: ContentModerationStatus | "all" }> = [
  { label: "全部状态", value: "all" },
  { label: "待审核", value: "pending" },
  { label: "已通过", value: "approved" },
  { label: "已拦截", value: "blocked" },
  { label: "已删除", value: "rejected" }
];

export function ContentManagementPanel() {
  const [items, setItems] = useState<AdminQueueItem[]>(adminQueue);
  const [selectedItem, setSelectedItem] = useState<AdminQueueItem | null>(adminQueue[0] ?? null);
  const [typeFilter, setTypeFilter] = useState<AdminContentType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<ContentModerationStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void refresh();
  }, []);

  async function refresh() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/moderation", { cache: "no-store" });
      const data = (await response.json()) as { items?: AdminQueueItem[] };
      const nextItems = sortItems(data.items ?? []);
      setItems(nextItems);
      setSelectedItem((current) => {
        if (current) {
          const fresh = nextItems.find((item) => item.id === current.id && item.type === current.type);
          if (fresh) return fresh;
        }
        return nextItems[0] ?? null;
      });
    } finally {
      setLoading(false);
    }
  }

  const visibleItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return sortItems(
      items.filter((item) => {
        const typeMatched = typeFilter === "all" || item.type === typeFilter;
        const statusMatched = statusFilter === "all" || item.moderationStatus === statusFilter;
        const queryMatched =
          !normalizedQuery ||
          item.title.toLowerCase().includes(normalizedQuery) ||
          item.content.toLowerCase().includes(normalizedQuery) ||
          item.authorName.toLowerCase().includes(normalizedQuery);
        return typeMatched && statusMatched && queryMatched;
      })
    );
  }, [items, query, statusFilter, typeFilter]);

  useEffect(() => {
    if (visibleItems.length === 0) {
      setSelectedItem(null);
      return;
    }

    if (!selectedItem || !visibleItems.some((item) => item.id === selectedItem.id && item.type === selectedItem.type)) {
      setSelectedItem(visibleItems[0]);
    }
  }, [selectedItem, visibleItems]);

  return (
    <section className="grid gap-5 xl:grid-cols-[1fr_380px]">
      <div className="min-w-0 rounded-lg border border-line bg-white shadow-subtle">
        <div className="border-b border-line p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-black">内容管理</h2>
              <p className="mt-1 text-sm text-neutral-500">统一查看数据库里的帖子、评论、私信和图片内容状态。</p>
            </div>
            <button
              onClick={refresh}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-line px-3 text-sm font-bold"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              刷新
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-3 xl:flex-row">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-10 min-w-64 rounded-lg border border-line bg-paper px-3 text-sm outline-none focus:border-brand-500"
              placeholder="搜索标题、内容或作者"
            />
            <div className="flex rounded-lg border border-line bg-paper p-1">
              {typeFilters.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setTypeFilter(item.value)}
                  className={cn("h-8 rounded-md px-3 text-xs font-bold text-neutral-500", typeFilter === item.value && "bg-white text-brand-700 shadow-sm")}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="flex rounded-lg border border-line bg-paper p-1">
              {statusFilters.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setStatusFilter(item.value)}
                  className={cn("h-8 rounded-md px-3 text-xs font-bold text-neutral-500", statusFilter === item.value && "bg-white text-brand-700 shadow-sm")}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="divide-y divide-line">
          {visibleItems.map((item) => {
            const active = selectedItem?.id === item.id && selectedItem.type === item.type;
            return (
              <article
                key={`${item.type}-${item.id}`}
                onClick={() => setSelectedItem(item)}
                className={cn("grid cursor-pointer gap-3 p-4 hover:bg-brand-50/40 md:grid-cols-[96px_1fr_210px] md:items-center", active && "bg-brand-50/70")}
              >
                <div>
                  <span className="rounded-md bg-paper px-2 py-1 text-xs font-bold">{contentTypeLabel(item.type)}</span>
                </div>
                <div className="min-w-0">
                  <div className="truncate font-black">{item.title}</div>
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-neutral-500">{item.content}</p>
                  <div className="mt-2 text-xs text-neutral-400">
                    {item.authorName} · {item.createdAt}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 md:justify-end">
                  <span className={cn("rounded-md border px-2 py-1 text-xs font-black", statusClass(item.moderationStatus))}>
                    {statusLabel(item.moderationStatus)}
                  </span>
                  <span className={cn("rounded-md border px-2 py-1 text-xs font-black", levelClass(item.moderation.level))}>
                    {levelLabel(item.moderation.level)} · {item.moderation.score}
                  </span>
                  {item.type === "post" && (
                    <Link
                      href={`/posts/${item.id}` as Route}
                      onClick={(event) => event.stopPropagation()}
                      className="rounded-md border border-line px-2 py-1 text-xs font-bold"
                    >
                      查看
                    </Link>
                  )}
                </div>
              </article>
            );
          })}

          {visibleItems.length === 0 && <div className="p-6 text-sm text-neutral-500">没有匹配的内容。</div>}
        </div>
      </div>

      <ContentDetail item={selectedItem} />
    </section>
  );
}

function ContentDetail({ item }: { item: AdminQueueItem | null }) {
  return (
    <aside className="rounded-lg border border-line bg-white p-4 shadow-subtle">
      <h2 className="font-black">内容详情</h2>
      {item ? (
        <div className="mt-4 space-y-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-paper px-2 py-1 text-xs font-bold">{contentTypeLabel(item.type)}</span>
              <span className={cn("rounded-md border px-2 py-1 text-xs font-black", statusClass(item.moderationStatus))}>
                {statusLabel(item.moderationStatus)}
              </span>
              <span className={cn("rounded-md border px-2 py-1 text-xs font-black", levelClass(item.moderation.level))}>
                {levelLabel(item.moderation.level)} · {item.moderation.score}
              </span>
            </div>
            <h3 className="mt-3 text-lg font-black">{item.title}</h3>
            <p className="mt-2 max-h-96 whitespace-pre-wrap overflow-y-auto rounded-lg border border-line bg-paper p-3 text-sm leading-6 text-neutral-700">
              {item.content}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <InfoBlock label="作者" value={item.authorName} />
            <InfoBlock label="发布时间" value={item.createdAt} />
            <InfoBlock label="内容 ID" value={item.id} />
            <InfoBlock label="举报数" value={String(item.reportCount)} />
          </div>
          {item.reviewNote && <div className="rounded-lg bg-paper p-3 text-sm leading-6 text-neutral-600">{item.reviewNote}</div>}
        </div>
      ) : (
        <p className="mt-3 text-sm text-neutral-500">请选择一条内容。</p>
      )}
    </aside>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-line p-3">
      <div className="text-xs font-black text-neutral-400">{label}</div>
      <div className="mt-1 break-all font-semibold">{value}</div>
    </div>
  );
}

function sortItems(items: AdminQueueItem[]) {
  return items.slice().sort((a, b) => dateValue(b.createdAt) - dateValue(a.createdAt));
}

function dateValue(value: string) {
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function statusLabel(status: AdminQueueItem["moderationStatus"]) {
  if (status === "approved") return "已通过";
  if (status === "blocked") return "已拦截";
  if (status === "rejected") return "已删除";
  return "待审核";
}

function statusClass(status: AdminQueueItem["moderationStatus"]) {
  if (status === "approved") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "blocked") return "border-neutral-300 bg-neutral-950 text-white";
  if (status === "rejected") return "border-red-200 bg-red-50 text-red-700";
  return "border-amber-200 bg-amber-50 text-amber-700";
}
