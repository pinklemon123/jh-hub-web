"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminContentType, AdminQueueItem } from "@/types/admin";
import { contentTypeLabel, levelClass, levelLabel } from "./admin-labels";

const filters: ReadonlyArray<{ label: string; value: AdminContentType | "all" }> = [
  { label: "全部", value: "all" },
  { label: "帖子", value: "post" },
  { label: "评论", value: "comment" },
  { label: "私信", value: "message" },
  { label: "图片", value: "image" }
];

const statusFilters = [
  { label: "全部状态", value: "all" },
  { label: "待人工审", value: "pending" },
  { label: "已通过", value: "approved" },
  { label: "已拦截", value: "blocked" },
  { label: "已删除", value: "rejected" }
] as const;

export function ModerationTable({
  queue,
  filter,
  statusFilter,
  query,
  onFilterChange,
  onStatusFilterChange,
  onQueryChange,
  onSelect,
  onAction
}: {
  queue: AdminQueueItem[];
  filter: AdminContentType | "all";
  statusFilter: (typeof statusFilters)[number]["value"];
  query: string;
  onFilterChange: (value: AdminContentType | "all") => void;
  onStatusFilterChange: (value: (typeof statusFilters)[number]["value"]) => void;
  onQueryChange: (value: string) => void;
  onSelect: (item: AdminQueueItem) => void;
  onAction: (action: string, item: AdminQueueItem) => void;
}) {
  return (
    <div className="min-w-0 rounded-lg border border-line bg-white shadow-subtle">
      <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-black">审核中心</h2>
          <p className="mt-1 text-sm text-neutral-500">按风险分数排序，优先处理私信和举报内容。</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex h-10 items-center gap-2 rounded-lg border border-line bg-paper px-3">
            <Search size={16} className="text-neutral-400" />
            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              className="w-48 bg-transparent text-sm outline-none"
              placeholder="搜索内容或用户"
            />
          </div>
          <div className="flex rounded-lg border border-line bg-paper p-1">
            {filters.map((item) => (
              <button
                key={item.value}
                onClick={() => onFilterChange(item.value)}
                className={cn(
                  "h-8 rounded-md px-3 text-xs font-bold text-neutral-500",
                  filter === item.value && "bg-white text-brand-700 shadow-sm"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex rounded-lg border border-line bg-paper p-1">
            {statusFilters.map((item) => (
              <button
                key={item.value}
                onClick={() => onStatusFilterChange(item.value)}
                className={cn(
                  "h-8 rounded-md px-3 text-xs font-bold text-neutral-500",
                  statusFilter === item.value && "bg-white text-brand-700 shadow-sm"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-left text-sm">
          <thead className="bg-paper text-xs text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-black">内容</th>
              <th className="px-4 py-3 font-black">类型</th>
              <th className="px-4 py-3 font-black">作者</th>
              <th className="px-4 py-3 font-black">风险</th>
              <th className="px-4 py-3 font-black">状态</th>
              <th className="px-4 py-3 font-black">标签</th>
              <th className="px-4 py-3 font-black">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {queue
              .slice()
              .sort((a, b) => b.moderation.score - a.moderation.score)
              .map((item) => (
                <tr key={`${item.type}-${item.id}`} className="align-top">
                  <td className="max-w-[360px] px-4 py-4">
                    <div className="font-black">{item.title}</div>
                    <p className="mt-1 line-clamp-2 text-neutral-500">{item.content}</p>
                    <div className="mt-2 text-xs text-neutral-400">{item.createdAt}</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-md bg-paper px-2 py-1 text-xs font-bold">{contentTypeLabel(item.type)}</span>
                  </td>
                  <td className="px-4 py-4 font-semibold">{item.authorName}</td>
                  <td className="px-4 py-4">
                    <span
                      className={cn(
                        "inline-flex min-w-24 justify-center rounded-md border px-2 py-1 text-xs font-black",
                        levelClass(item.moderation.level)
                      )}
                    >
                      {levelLabel(item.moderation.level)} · {item.moderation.score}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={cn("inline-flex rounded-md border px-2 py-1 text-xs font-black", statusClass(item.moderationStatus))}>
                      {statusLabel(item.moderationStatus)}
                    </span>
                    {item.reviewNote && <div className="mt-2 max-w-36 text-xs leading-5 text-neutral-400">{item.reviewNote}</div>}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex max-w-56 flex-wrap gap-1">
                      {(item.moderation.tags.length ? item.moderation.tags : ["无风险标签"]).map((tag) => (
                        <span key={tag} className="rounded-md border border-line bg-white px-2 py-1 text-xs text-neutral-600">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => onSelect(item)} className="rounded-md border border-line px-2 py-1 text-xs font-bold">
                        详情
                      </button>
                      <button onClick={() => onAction("approve", item)} className="rounded-md border border-line px-2 py-1 text-xs font-bold">
                        通过
                      </button>
                      <button onClick={() => onAction("block", item)} className="rounded-md bg-neutral-950 px-2 py-1 text-xs font-bold text-white">
                        拦截
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function statusLabel(status: AdminQueueItem["moderationStatus"]) {
  if (status === "approved") return "已通过";
  if (status === "blocked") return "已拦截";
  if (status === "rejected") return "已删除";
  return "待人工审";
}

function statusClass(status: AdminQueueItem["moderationStatus"]) {
  if (status === "approved") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "blocked") return "border-neutral-300 bg-neutral-950 text-white";
  if (status === "rejected") return "border-red-200 bg-red-50 text-red-700";
  return "border-amber-200 bg-amber-50 text-amber-700";
}
