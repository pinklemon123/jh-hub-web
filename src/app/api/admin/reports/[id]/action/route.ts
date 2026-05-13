import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const action = String(body.action ?? "");
  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  if (action === "ignore") {
    const item = await prisma.report.update({ where: { id }, data: { status: "ignored" } });
    await writeAuditLog("忽略举报", report.id, report.reason);
    return NextResponse.json({ ok: true, item });
  }

  if (action === "warn") {
    const accused = await findAccusedUser(report.targetType, report.targetId, report.accusedName);
    if (accused) {
      await prisma.systemMessage.create({
        data: {
          scope: "user",
          targetUserId: accused.id,
          targetName: accused.name,
          title: "举报处理警告",
          body: `你被举报的内容已进入处理流程。举报原因：${report.reason}。请遵守社区规范，避免再次违规。`,
          messageType: "warning"
        }
      });
    }
    const item = await prisma.report.update({ where: { id }, data: { status: "reviewing" } });
    await writeAuditLog("警告举报对象", report.id, report.reason);
    return NextResponse.json({ ok: true, item });
  }

  if (action === "resolve") {
    await blockReportedTarget(report.targetType, report.targetId);
    const item = await prisma.report.update({ where: { id }, data: { status: "resolved" } });
    await writeAuditLog("处理举报并拦截", report.id, report.reason);
    return NextResponse.json({ ok: true, item });
  }

  return NextResponse.json({ ok: false, error: "invalid_action" }, { status: 400 });
}

async function writeAuditLog(action: string, target: string, reason: string) {
  await prisma.adminAuditLog.create({
    data: {
      admin: "admin01",
      action,
      target,
      reason: reason.slice(0, 240)
    }
  });
}

async function findAccusedUser(targetType: string, targetId: string, accusedName: string) {
  if (targetType === "post") {
    const post = await prisma.communityPost.findUnique({ where: { id: targetId }, select: { authorId: true, authorName: true } });
    return post ? { id: post.authorId, name: post.authorName } : null;
  }
  if (targetType === "comment") {
    const comment = await prisma.postComment.findUnique({ where: { id: targetId }, select: { authorId: true, authorName: true } });
    return comment ? { id: comment.authorId, name: comment.authorName } : null;
  }
  if (targetType === "message") {
    const message = await prisma.directMessage.findUnique({ where: { id: targetId }, include: { sender: true } });
    return message ? { id: message.senderId, name: message.sender.name } : null;
  }
  return prisma.hubUser.findFirst({ where: { name: accusedName }, select: { id: true, name: true } });
}

async function blockReportedTarget(targetType: string, targetId: string) {
  const data = { moderationStatus: "blocked", reviewedAt: new Date(), reviewNote: "举报处理后拦截。" };
  if (targetType === "post") await prisma.communityPost.update({ where: { id: targetId }, data }).catch(() => undefined);
  if (targetType === "comment") await prisma.postComment.update({ where: { id: targetId }, data }).catch(() => undefined);
  if (targetType === "message") await prisma.directMessage.update({ where: { id: targetId }, data }).catch(() => undefined);
}
