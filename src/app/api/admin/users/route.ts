import { NextResponse } from "next/server";
import { ensureCommunitySeed } from "@/lib/community-db";
import { moderateContent } from "@/lib/moderation";
import { prisma } from "@/lib/prisma";
import type { AdminUserRisk } from "@/types/admin";

export async function GET() {
  await ensureCommunitySeed();

  const [users, posts, comments, messages, reports] = await Promise.all([
    prisma.hubUser.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.communityPost.findMany(),
    prisma.postComment.findMany(),
    prisma.directMessage.findMany(),
    prisma.report.findMany()
  ]);

  const items: AdminUserRisk[] = users
    .filter((user) => user.id !== "system")
    .map((user) => {
      const authoredPosts = posts.filter((post) => post.authorId === user.id);
      const authoredComments = comments.filter((comment) => comment.authorId === user.id);
      const authoredMessages = messages.filter((message) => message.senderId === user.id);
      const authoredContent = [
        ...authoredPosts.map((post) => `${post.title} ${post.summary} ${post.content}`),
        ...authoredComments.map((comment) => comment.content),
        ...authoredMessages.map((message) => message.content)
      ];
      const riskScore = Math.min(100, authoredContent.reduce((total, text) => total + moderateContent(text).score, 0));
      const reportCount = reports.filter((report) => report.targetId === user.id || report.accusedName === user.name).length;
      const violationCount = [
        ...authoredPosts.map((post) => post.moderationStatus),
        ...authoredComments.map((comment) => comment.moderationStatus),
        ...authoredMessages.map((message) => message.moderationStatus)
      ].filter((status) => status === "blocked" || status === "rejected").length;

      return {
        id: user.id,
        name: user.name,
        college: user.college,
        status: user.status === "muted" || user.status === "banned" || user.status === "watchlist" ? user.status : riskScore >= 70 ? "watchlist" : "normal",
        riskScore,
        violationCount,
        reportCount,
        tags: [
          ...(riskScore >= 70 ? ["高风险用户"] : []),
          ...(reportCount > 0 ? ["被举报"] : []),
          ...(authoredMessages.length >= 5 ? ["高频私信"] : [])
        ],
        lastActive: user.updatedAt.toLocaleString("zh-CN")
      } satisfies AdminUserRisk;
    })
    .sort((a, b) => b.riskScore - a.riskScore);

  return NextResponse.json({ ok: true, items });
}
