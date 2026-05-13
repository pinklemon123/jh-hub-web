"use client";

import { MessageSquareWarning } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { AdminReport } from "@/types/admin";
import { levelClass, levelLabel } from "./admin-labels";

export function ReportsPanel({ limit }: { limit?: number }) {
  const [reports, setReports] = useState<AdminReport[]>([]);

  useEffect(() => {
    fetch("/api/admin/reports")
      .then((response) => response.json())
      .then((data: { items?: AdminReport[] }) => setReports(data.items ?? []))
      .catch(() => setReports([]));
  }, []);

  const visibleReports = typeof limit === "number" ? reports.slice(0, limit) : reports;

  async function handleReport(report: AdminReport, action: "ignore" | "warn" | "resolve") {
    const response = await fetch(`/api/admin/reports/${report.id}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action })
    });
    if (!response.ok) return;
    setReports((current) =>
      current.map((item) =>
        item.id === report.id
          ? {
              ...item,
              status: action === "ignore" ? "ignored" : action === "resolve" ? "resolved" : "reviewing"
            }
          : item
      )
    );
  }

  return (
    <section className="rounded-lg border border-line bg-white p-4 shadow-subtle">
      <div className="flex items-center gap-2">
        <MessageSquareWarning size={18} className="text-brand-600" />
        <h2 className="font-black">举报中心</h2>
      </div>
      <div className="mt-4 space-y-3">
        {visibleReports.length === 0 ? (
          <p className="text-sm text-neutral-500">暂无举报。</p>
        ) : (
          visibleReports.map((report) => (
            <article key={report.id} className="rounded-lg border border-line p-3">
              <div className="flex items-center justify-between gap-3">
                <span className={cn("rounded-md border px-2 py-1 text-xs font-black", levelClass(report.risk))}>
                  {levelLabel(report.risk)}
                </span>
                <span className={cn("rounded-md border px-2 py-1 text-xs font-black", reportStatusClass(report.status))}>
                  {reportStatusLabel(report.status)}
                </span>
                <span className="text-xs text-neutral-400">{report.createdAt}</span>
              </div>
              <div className="mt-3 text-sm font-black">{report.reason}</div>
              <p className="mt-1 line-clamp-2 text-sm text-neutral-500">{report.snapshot}</p>
              <div className="mt-3 text-xs text-neutral-400">
                {report.reporter} 举报 {report.accused} / {report.targetType}:{report.targetId}
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => handleReport(report, "ignore")} className="rounded-md border border-line px-2 py-1 text-xs font-bold">
                  忽略
                </button>
                <button onClick={() => handleReport(report, "warn")} className="rounded-md border border-line px-2 py-1 text-xs font-bold">
                  警告
                </button>
                <button onClick={() => handleReport(report, "resolve")} className="rounded-md bg-neutral-950 px-2 py-1 text-xs font-bold text-white">
                  处理
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function reportStatusLabel(status: AdminReport["status"]) {
  if (status === "resolved") return "已处理";
  if (status === "ignored") return "已忽略";
  if (status === "reviewing") return "已警告";
  return "待处理";
}

function reportStatusClass(status: AdminReport["status"]) {
  if (status === "resolved") return "border-neutral-300 bg-neutral-950 text-white";
  if (status === "ignored") return "border-line bg-paper text-neutral-500";
  if (status === "reviewing") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-red-200 bg-red-50 text-red-700";
}
