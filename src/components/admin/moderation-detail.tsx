"use client";

import { Gavel } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminQueueItem } from "@/types/admin";
import { levelClass, levelLabel } from "./admin-labels";

export function ModerationDetail({
  item,
  onAction
}: {
  item: AdminQueueItem | null;
  onAction: (action: string, item?: AdminQueueItem | null) => void;
}) {
  return (
    <section className="rounded-lg border border-line bg-white p-4 shadow-subtle">
      <div className="flex items-center gap-2">
        <Gavel size={18} className="text-brand-600" />
        <h2 className="font-black">处理详情</h2>
      </div>
      {item ? (
        <div className="mt-4 space-y-4">
          <div>
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-black">{item.title}</h3>
              <span className={cn("rounded-md border px-2 py-1 text-xs font-black", levelClass(item.moderation.level))}>
                {levelLabel(item.moderation.level)} · {item.moderation.score}
              </span>
            </div>
            <div className="mt-2">
              <span className={cn("rounded-md border px-2 py-1 text-xs font-black", statusClass(item.moderationStatus))}>
                {statusLabel(item.moderationStatus)}
              </span>
              {item.reviewNote && <span className="ml-2 text-xs text-neutral-400">{item.reviewNote}</span>}
            </div>
            <p className="mt-2 max-h-32 overflow-y-auto rounded-lg border border-line bg-paper p-3 text-sm leading-6 text-neutral-600">
              {item.content}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg border border-line p-3">
              <div className="text-xs font-black text-neutral-400">作者</div>
              <div className="mt-1 font-semibold">{item.authorName}</div>
            </div>
            <div className="rounded-lg border border-line p-3">
              <div className="text-xs font-black text-neutral-400">举报数</div>
              <div className="mt-1 font-semibold">{item.reportCount}</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => onAction("approve")} className="rounded-lg border border-line px-3 py-2 text-sm font-bold">
              通过
            </button>
            <button onClick={() => onAction("reject")} className="rounded-lg border border-line px-3 py-2 text-sm font-bold">
              删除
            </button>
            <button onClick={() => onAction("warn")} className="rounded-lg border border-line px-3 py-2 text-sm font-bold">
              警告
            </button>
            <button onClick={() => onAction("mute")} className="rounded-lg bg-neutral-950 px-3 py-2 text-sm font-bold text-white">
              禁言1天
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm text-neutral-500">请选择一条审核内容。</p>
      )}
    </section>
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
