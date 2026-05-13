import { NextResponse } from "next/server";
import { moderateContent } from "@/lib/moderation";
import { ensureCommunitySeed } from "@/lib/community-db";
import { prisma } from "@/lib/prisma";
import type { AdminQueueItem, ContentModerationStatus, ModerationDecision, ModerationResult } from "@/types/admin";

function defaultStatus(decision: ModerationDecision): ContentModerationStatus {
  if (decision === "block") return "blocked";
  if (decision === "allow") return "approved";
  return "pending";
}

function resolvedStatus(rowStatus: string, moderation: ModerationResult): ContentModerationStatus {
  if (rowStatus === "approved" || rowStatus === "rejected" || rowStatus === "blocked") return rowStatus;
  return defaultStatus(moderation.decision);
}

export async function GET() {
  await ensureCommunitySeed();
  const [posts, comments, messages, reports] = await Promise.all([
    prisma.communityPost.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.postComment.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.directMessage.findMany({ orderBy: { createdAt: "desc" }, include: { sender: true } }),
    prisma.report.findMany()
  ]);

  const reportCount = (targetType: string, targetId: string) =>
    reports.filter((report) => report.targetType === targetType && report.targetId === targetId).length;

  const postItems = await Promise.all(posts.map(async (post) => {
    const moderation = moderateContent(`${post.title} ${post.summary} ${post.content}`);
    const moderationStatus = resolvedStatus(post.moderationStatus, moderation);
    if (post.moderationStatus === "pending" && moderationStatus !== "pending") {
      await prisma.communityPost.update({
        where: { id: post.id },
        data: { moderationStatus, reviewedAt: new Date(), reviewNote: moderation.message }
      });
    }
    return {
      id: post.id,
      type: "post" as const,
      title: post.title,
      content: `${post.title}\n${post.summary}\n${post.content}`,
      authorId: post.authorId,
      authorName: post.authorName,
      target: post.board,
      createdAt: post.createdAt.toLocaleString("zh-CN"),
      reportCount: reportCount("post", post.id),
      moderationStatus,
      reviewNote: post.reviewNote,
      moderation
    };
  }));

  const commentItems = await Promise.all(comments.map(async (comment) => {
    const moderation = moderateContent(comment.content);
    const moderationStatus = resolvedStatus(comment.moderationStatus, moderation);
    if (comment.moderationStatus === "pending" && moderationStatus !== "pending") {
      await prisma.postComment.update({
        where: { id: comment.id },
        data: { moderationStatus, reviewedAt: new Date(), reviewNote: moderation.message }
      });
    }
    return {
      id: comment.id,
      type: "comment" as const,
      title: `评论 / ${comment.postId}`,
      content: comment.content,
      authorId: comment.authorId,
      authorName: comment.authorName,
      target: comment.postId,
      createdAt: comment.createdAt.toLocaleString("zh-CN"),
      reportCount: reportCount("comment", comment.id),
      moderationStatus,
      reviewNote: comment.reviewNote,
      moderation
    };
  }));

  const messageItems = await Promise.all(messages.map(async (message) => {
    const moderation = moderateContent(message.content);
    const moderationStatus = resolvedStatus(message.moderationStatus, moderation);
    if (message.moderationStatus === "pending" && moderationStatus !== "pending") {
      await prisma.directMessage.update({
        where: { id: message.id },
        data: { moderationStatus, reviewedAt: new Date(), reviewNote: moderation.message }
      });
    }
    return {
      id: message.id,
      type: "message" as const,
      title: `私信 / ${message.conversationId}`,
      content: message.content,
      authorId: message.senderId,
      authorName: message.sender.name,
      target: message.receiverId ?? message.conversationId,
      createdAt: message.createdAt.toLocaleString("zh-CN"),
      reportCount: reportCount("message", message.id),
      moderationStatus,
      reviewNote: message.reviewNote,
      moderation
    };
  }));

  const items: AdminQueueItem[] = [...postItems, ...commentItems, ...messageItems];

  return NextResponse.json({ ok: true, items });
}
