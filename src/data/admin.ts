import { comments, conversations, messages, posts, users } from "@/data/mock";
import { moderateContent } from "@/lib/moderation";
import type { AdminQueueItem, AdminReport, AdminUserRisk } from "@/types/admin";

const messageOwner = (senderId: string) => users.find((user) => user.id === senderId);

export const adminQueue: AdminQueueItem[] = [
  ...posts.map((post) => ({
    id: post.id,
    type: "post" as const,
    title: post.title,
    content: `${post.title} ${post.summary} ${post.content}`,
    authorId: post.authorId,
    authorName: post.author,
    target: post.board,
    createdAt: post.createdAt,
    reportCount: post.id === "p_004" ? 2 : 0,
    moderationStatus: "approved" as const,
    moderation: moderateContent(`${post.title} ${post.summary} ${post.content}`)
  })),
  ...comments.map((comment) => ({
    id: comment.id,
    type: "comment" as const,
    title: `评论 / ${comment.postId}`,
    content: comment.content,
    authorId: comment.authorId,
    authorName: comment.author,
    target: comment.postId,
    createdAt: comment.time,
    reportCount: comment.id === "cm_004" ? 1 : 0,
    moderationStatus: "approved" as const,
    moderation: moderateContent(comment.content)
  })),
  ...messages.map((message) => {
    const owner = messageOwner(message.senderId);
    const conversation = conversations.find((item) => item.id === message.conversationId);

    return {
      id: message.id,
      type: "message" as const,
      title: conversation?.project ?? "私信",
      content: message.content,
      authorId: message.senderId,
      authorName: owner?.name ?? "系统",
      target: conversation?.target.name,
      createdAt: message.time,
      reportCount: message.id === "m_003" ? 1 : 0,
      moderationStatus: "approved" as const,
      moderation: moderateContent(message.content)
    };
  }),
  {
    id: "img_review_001",
    type: "image",
    title: "活动海报图片",
    content: "用户上传活动宣传图，等待后续接入图片 OCR 与云内容安全。",
    authorId: "u_001",
    authorName: users[1]?.name ?? "用户",
    target: "图片审核",
    createdAt: "今天",
    reportCount: 0,
    moderationStatus: "pending",
    moderation: {
      decision: "review",
      level: "suspicious",
      score: 38,
      tags: ["图片待审", "OCR待接入"],
      hits: [{ label: "图片内容", category: "图片审核", weight: 38, evidence: "人工复核队列" }],
      message: "图片内容需要进入人工审核。"
    }
  }
];

export const adminReports: AdminReport[] = [
  {
    id: "r_001",
    targetType: "message",
    targetId: "m_003",
    reporter: users[1]?.name ?? "举报人",
    accused: users[2]?.name ?? "被举报人",
    reason: "疑似私下引流或索要联系方式",
    snapshot: messages.find((message) => message.id === "m_003")?.content ?? "",
    createdAt: "今天 19:28",
    status: "open",
    risk: "suspicious"
  },
  {
    id: "r_002",
    targetType: "post",
    targetId: "p_004",
    reporter: users[4]?.name ?? "举报人",
    accused: users[1]?.name ?? "被举报人",
    reason: "内容可能偏离版块，需要管理员确认",
    snapshot: posts.find((post) => post.id === "p_004")?.summary ?? "",
    createdAt: "昨天 21:16",
    status: "reviewing",
    risk: "normal"
  },
  {
    id: "r_003",
    targetType: "user",
    targetId: "u_002",
    reporter: users[3]?.name ?? "举报人",
    accused: users[2]?.name ?? "被举报人",
    reason: "短时间重复私信",
    snapshot: "同一项目邀请在 1 分钟内重复发送 6 次",
    createdAt: "昨天 18:40",
    status: "open",
    risk: "high"
  }
];

export const adminUserRisks: AdminUserRisk[] = users
  .filter((user) => user.id !== "system")
  .map((user, index) => {
    const authoredItems = adminQueue.filter((item) => item.authorId === user.id);
    const riskScore = Math.min(
      100,
      authoredItems.reduce((total, item) => total + item.moderation.score, 0) + index * 7
    );
    const reportCount = adminReports.filter((report) => report.targetId === user.id || report.accused === user.name).length;

    return {
      id: user.id,
      name: user.name,
      college: user.college,
      status: riskScore >= 70 ? "watchlist" : "normal",
      riskScore,
      violationCount: authoredItems.filter((item) => item.moderation.decision !== "allow").length,
      reportCount,
      tags: [
        ...(riskScore >= 60 ? ["高风险用户"] : []),
        ...(reportCount > 0 ? ["被举报"] : []),
        ...(index === 1 ? ["高频私信"] : [])
      ],
      lastActive: index === 0 ? "刚刚" : `${index + 1}小时前`
    };
  });

export const adminOverview = {
  newUsersToday: 18,
  postsToday: posts.length + 9,
  activeUsers: 126,
  reportCount: adminReports.filter((report) => report.status === "open").length,
  riskyContent: adminQueue.filter((item) => item.moderation.level !== "normal").length,
  pendingReview: adminQueue.filter((item) => item.moderation.decision === "review").length,
  blockedContent: adminQueue.filter((item) => item.moderation.decision === "block").length,
  mutedUsers: adminUserRisks.filter((user) => user.status === "muted" || user.status === "watchlist").length
};

export const adminRules = [
  { id: "rule_contact_wechat", name: "包含微信/QQ等联系方式", trigger: "关键词或正则命中", action: "风险 +35，进入审核", enabled: true },
  { id: "rule_phone", name: "包含手机号", trigger: "1[3-9] 开头 11 位号码", action: "风险 +45，进入审核", enabled: true },
  { id: "rule_repeat", name: "短时间重复内容", trigger: "重复字符或短句", action: "标记重复刷屏", enabled: true },
  { id: "rule_illegal", name: "违法违规词", trigger: "毒品、赌博、黑产等", action: "高风险自动拦截", enabled: true },
  { id: "rule_campus", name: "校园违规交易", trigger: "代考、代写论文、买论文", action: "进入人工审核", enabled: true }
];

export const adminAuditLogs = [
  { id: "log_001", admin: "admin01", action: "拦截私信", target: "m_003", reason: "疑似引流或联系方式", createdAt: "今天 19:32" },
  { id: "log_002", admin: "admin01", action: "受理举报", target: "r_001", reason: "用户举报私信骚扰", createdAt: "今天 19:29" },
  { id: "log_003", admin: "admin02", action: "通过帖子", target: "p_001", reason: "内容正常，保留发布", createdAt: "昨天 21:41" }
];
