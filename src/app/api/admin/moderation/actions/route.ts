import { NextResponse } from "next/server";
import { moderateContent } from "@/lib/moderation";
import { prisma } from "@/lib/prisma";
import type { AdminContentType, ContentModerationStatus } from "@/types/admin";

const actionStatus: Record<string, ContentModerationStatus | undefined> = {
  approve: "approved",
  reject: "rejected",
  block: "blocked"
};

export async function POST(request: Request) {
  const body = await request.json();
  const type = String(body.type ?? "") as AdminContentType;
  const id = String(body.id ?? "");
  const action = String(body.action ?? "");
  const note = String(body.note ?? "");

  if (!id || !["post", "comment", "message"].includes(type)) {
    return NextResponse.json({ ok: false, error: "invalid_target" }, { status: 400 });
  }

  const target = await findTarget(type, id);
  if (!target) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  if (action === "warn") {
    await prisma.systemMessage.create({
      data: {
        scope: "user",
        targetUserId: target.authorId,
        targetName: target.authorName,
        title: "内容违规警告",
        body: note || `你发布或发送的内容「${target.title}」存在违规风险，请遵守社区规范。再次违规可能会被限制发帖或私信。`,
        messageType: "warning"
      }
    });
    await writeAuditLog(action, `${type}:${id}`, target.content);
    return NextResponse.json({ ok: true, item: await toQueueItem(type, id) });
  }

  if (action === "mute") {
    await prisma.hubUser.update({
      where: { id: target.authorId },
      data: { status: "muted" }
    });
    await prisma.systemMessage.create({
      data: {
        scope: "user",
        targetUserId: target.authorId,
        targetName: target.authorName,
        title: "账号禁言通知",
        body: note || "你的账号因内容违规已被管理员禁言，请联系管理员处理。",
        messageType: "warning"
      }
    });
    await writeAuditLog(action, `${type}:${id}`, target.content);
    return NextResponse.json({ ok: true, item: await toQueueItem(type, id) });
  }

  const moderationStatus = actionStatus[action];
  if (!moderationStatus) return NextResponse.json({ ok: false, error: "invalid_action" }, { status: 400 });

  await updateTargetStatus(type, id, moderationStatus, note);
  await writeAuditLog(action, `${type}:${id}`, note || target.content);
  return NextResponse.json({ ok: true, item: await toQueueItem(type, id) });
}

async function writeAuditLog(action: string, target: string, reason: string) {
  await prisma.adminAuditLog.create({
    data: {
      admin: "admin01",
      action: actionLabel(action),
      target,
      reason: reason.slice(0, 240)
    }
  });
}

function actionLabel(action: string) {
  if (action === "approve") return "通过内容";
  if (action === "block") return "拦截内容";
  if (action === "reject") return "删除/隐藏内容";
  if (action === "warn") return "警告用户";
  if (action === "mute") return "禁言用户";
  return action;
}

async function findTarget(type: AdminContentType, id: string) {
  if (type === "post") {
    const row = await prisma.communityPost.findUnique({ where: { id } });
    return row
      ? { title: row.title, content: `${row.title}\n${row.summary}\n${row.content}`, authorId: row.authorId, authorName: row.authorName, target: row.board }
      : null;
  }
  if (type === "comment") {
    const row = await prisma.postComment.findUnique({ where: { id } });
    return row ? { title: `评论 / ${row.postId}`, content: row.content, authorId: row.authorId, authorName: row.authorName, target: row.postId } : null;
  }
  if (type === "message") {
    const row = await prisma.directMessage.findUnique({ where: { id }, include: { sender: true } });
    return row
      ? {
          title: `私信 / ${row.conversationId}`,
          content: row.content,
          authorId: row.senderId,
          authorName: row.sender.name,
          target: row.receiverId ?? row.conversationId
        }
      : null;
  }
  return null;
}

async function updateTargetStatus(type: AdminContentType, id: string, moderationStatus: ContentModerationStatus, note: string) {
  const data = { moderationStatus, reviewedAt: new Date(), reviewNote: note || statusNote(moderationStatus) };
  if (type === "post") await prisma.communityPost.update({ where: { id }, data });
  if (type === "comment") await prisma.postComment.update({ where: { id }, data });
  if (type === "message") await prisma.directMessage.update({ where: { id }, data });
}

function statusNote(status: ContentModerationStatus) {
  if (status === "approved") return "管理员已通过内容。";
  if (status === "blocked") return "管理员已拦截内容。";
  return "管理员已删除或隐藏内容。";
}

async function toQueueItem(type: AdminContentType, id: string) {
  const target = await findTarget(type, id);
  if (!target) return null;
  const reportCount = await prisma.report.count({ where: { targetType: type, targetId: id } });
  const moderation = moderateContent(target.content);
  const status = await getTargetStatus(type, id);
  return {
    id,
    type,
    title: target.title,
    content: target.content,
    authorId: target.authorId,
    authorName: target.authorName,
    target: target.target,
    createdAt: "刚刚",
    reportCount,
    moderationStatus: status.moderationStatus,
    reviewNote: status.reviewNote,
    moderation
  };
}

async function getTargetStatus(type: AdminContentType, id: string) {
  if (type === "post") {
    const row = await prisma.communityPost.findUnique({ where: { id }, select: { moderationStatus: true, reviewNote: true } });
    return { moderationStatus: row?.moderationStatus ?? "pending", reviewNote: row?.reviewNote ?? "" };
  }
  if (type === "comment") {
    const row = await prisma.postComment.findUnique({ where: { id }, select: { moderationStatus: true, reviewNote: true } });
    return { moderationStatus: row?.moderationStatus ?? "pending", reviewNote: row?.reviewNote ?? "" };
  }
  const row = await prisma.directMessage.findUnique({ where: { id }, select: { moderationStatus: true, reviewNote: true } });
  return { moderationStatus: row?.moderationStatus ?? "pending", reviewNote: row?.reviewNote ?? "" };
}
