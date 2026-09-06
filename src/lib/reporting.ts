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
  const response = await fetch("/api/reports", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message ?? "举报提交失败，请重试。");
  return data.item;
}
