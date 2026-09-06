"use client";

import { Flag, X } from "lucide-react";
import { useState } from "react";
import { reportReasons, submitReport, type ReportTargetType } from "@/lib/reporting";
import { cn } from "@/lib/utils";

export function ReportButton({
  targetType,
  targetId,
  accusedName,
  snapshot,
  className,
  compact = false
}: {
  targetType: ReportTargetType;
  targetId: string;
  accusedName: string;
  snapshot: string;
  className?: string;
  compact?: boolean;
}) {
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<(typeof reportReasons)[number]>("广告/引流");
  const [detail, setDetail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function close() {
    setOpen(false);
    setSubmitted(false);
    setDetail("");
    setReason("广告/引流");
  }

  async function submit() {
    setSubmitting(true);
    setError("");
    try {
    await submitReport({
      targetType,
      targetId,
      accusedName,
      reason,
      detail: detail.trim(),
      snapshot
    });
    setSubmitted(true);
    } catch (error) { setError(error instanceof Error ? error.message : "提交失败。"); }
    finally { setSubmitting(false); }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-1 rounded-md text-xs font-bold text-neutral-500 hover:text-red-700",
          !compact && "border border-line px-2 py-1 hover:bg-red-50",
          className
        )}
      >
        <Flag size={14} />
        举报
      </button>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-neutral-950/45 px-4">
          <div className="w-full max-w-lg rounded-lg bg-white shadow-subtle">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div>
                <h2 className="font-black">提交举报</h2>
                <p className="mt-1 text-sm text-neutral-500">举报会进入后台举报中心，由管理员处理。</p>
              </div>
              <button
                type="button"
                onClick={close}
                className="grid size-9 place-items-center rounded-lg text-neutral-500 hover:bg-paper"
                aria-label="关闭举报弹窗"
              >
                <X size={17} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
              {submitted ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
                  举报已提交。管理员会在后台看到举报对象、原因、原始内容和处理状态。
                </div>
              ) : (
                <>
                  <div>
                    <div className="text-xs font-black text-neutral-500">被举报对象</div>
                    <div className="mt-1 text-sm font-semibold">{accusedName}</div>
                  </div>

                  <div>
                    <div className="text-xs font-black text-neutral-500">举报原因</div>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {reportReasons.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setReason(item)}
                          className={cn(
                            "h-9 rounded-lg border border-line px-3 text-sm font-bold text-neutral-600",
                            reason === item && "border-brand-600 bg-brand-50 text-brand-700"
                          )}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-black text-neutral-500">原始内容</div>
                    <p className="mt-2 max-h-24 overflow-y-auto rounded-lg border border-line bg-paper p-3 text-sm leading-6 text-neutral-600">
                      {snapshot}
                    </p>
                  </div>

                  <textarea
                    value={detail}
                    onChange={(event) => setDetail(event.target.value)}
                    className="min-h-24 w-full resize-y rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-brand-500"
                    placeholder="补充说明，例如聊天上下文、骚扰行为、广告链接等"
                  />
                </>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-line px-5 py-4">
              <button type="button" onClick={close} className="h-10 rounded-lg border border-line px-4 text-sm font-bold">
                {submitted ? "关闭" : "取消"}
              </button>
              {!submitted && (
                <button
                  type="button"
                  onClick={submit}
                  disabled={submitting}
                  className="h-10 rounded-lg bg-neutral-950 px-4 text-sm font-bold text-white disabled:opacity-60"
                >
                  {submitting ? "提交中" : "提交举报"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
