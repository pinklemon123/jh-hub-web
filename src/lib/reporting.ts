import type { AdminContentType } from "@/types/admin";

export type ReportTargetType = AdminContentType | "user";

export interface ReportPayload {
  targetType: ReportTargetType;
  targetId: string;
  accusedName: string;
  reason: string;
  detail: string;
  snapshot: string;
}

export interface LocalReport extends ReportPayload {
  id: string;
  reporterId: string;
  status: "submitted";
  createdAt: string;
}

export const reportReasons = ["广告/引流", "骚扰/人身攻击", "色情低俗", "违法违规", "校园违规", "其他"] as const;

export async function submitReport(payload: ReportPayload) {
  const report: LocalReport = {
    ...payload,
    id: `report_${Date.now()}`,
    reporterId: "u_001",
    status: "submitted",
    createdAt: new Date().toISOString()
  };

  if (typeof window !== "undefined") {
    const key = "jinghu_local_reports";
    const current = JSON.parse(window.localStorage.getItem(key) ?? "[]") as LocalReport[];
    window.localStorage.setItem(key, JSON.stringify([report, ...current].slice(0, 50)));
  }

  await fetch("/api/reports", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(report)
  });

  return report;
}
