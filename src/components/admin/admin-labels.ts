import type { AdminContentType, ModerationLevel } from "@/types/admin";

export function levelClass(level: ModerationLevel) {
  if (level === "blocked") return "border-neutral-900 bg-neutral-900 text-white";
  if (level === "high") return "border-red-200 bg-red-50 text-red-700";
  if (level === "suspicious") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

export function levelLabel(level: ModerationLevel) {
  return {
    normal: "正常",
    suspicious: "疑似违规",
    high: "高风险",
    blocked: "自动拦截"
  }[level];
}

export function contentTypeLabel(type: AdminContentType) {
  return {
    post: "帖子",
    comment: "评论",
    message: "私信",
    image: "图片"
  }[type];
}
