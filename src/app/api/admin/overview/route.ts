import { NextResponse } from "next/server";
import { ensureCommunitySeed } from "@/lib/community-db";
import { moderateContent } from "@/lib/moderation";
import { prisma } from "@/lib/prisma";
import type { AdminOverview } from "@/types/admin";

export async function GET() {
  await ensureCommunitySeed();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [newUsersToday, postsToday, activeUsers, openReports, posts, comments, messages, mutedUsers] = await Promise.all([
    prisma.hubUser.count({ where: { createdAt: { gte: today } } }),
    prisma.communityPost.count({ where: { createdAt: { gte: today } } }),
    prisma.hubUser.count({ where: { online: true } }),
    prisma.report.count({ where: { status: "open" } }),
    prisma.communityPost.findMany({ select: { title: true, summary: true, content: true, moderationStatus: true } }),
    prisma.postComment.findMany({ select: { content: true, moderationStatus: true } }),
    prisma.directMessage.findMany({ select: { content: true, moderationStatus: true } }),
    prisma.hubUser.count({ where: { status: { in: ["muted", "watchlist"] } } })
  ]);

  const moderationItems = [
    ...posts.map((post) => ({ text: `${post.title} ${post.summary} ${post.content}`, status: post.moderationStatus })),
    ...comments.map((comment) => ({ text: comment.content, status: comment.moderationStatus })),
    ...messages.map((message) => ({ text: message.content, status: message.moderationStatus }))
  ];

  const overview: AdminOverview = {
    newUsersToday,
    postsToday,
    activeUsers,
    reportCount: openReports,
    riskyContent: moderationItems.filter((item) => moderateContent(item.text).level !== "normal").length,
    pendingReview: moderationItems.filter((item) => item.status === "pending").length,
    blockedContent: moderationItems.filter((item) => item.status === "blocked").length,
    mutedUsers
  };

  return NextResponse.json({ ok: true, item: overview });
}
