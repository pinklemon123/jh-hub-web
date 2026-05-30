import { comments, messages, posts, teams, users } from "@/data/mock";
import type { Comment, Message, Post, TeamProject, User } from "@/types";
import { adminAuditLogs, adminRules } from "@/data/admin";
import type { AdminAuditLog, AdminRule } from "@/types/admin";
import { prisma } from "@/lib/prisma";

function unique(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function deriveTeamSkills(team: TeamProject) {
  const currentSkills = unique(team.currentSkills ?? team.tags);
  const missingSkills = unique(team.missingSkills ?? team.missingRoles);
  const requiredSkills = unique([...(team.requiredSkills ?? []), ...currentSkills, ...missingSkills]);
  return { requiredSkills, currentSkills, missingSkills };
}

export async function ensureCommunitySeed() {
  const existingUsers = await prisma.hubUser.count();

  if (existingUsers === 0) {
    await prisma.hubUser.createMany({
      data: users.map((user) => ({
        id: user.id,
        name: user.name,
        realName: user.realName,
        college: user.college,
        grade: user.grade,
        direction: user.direction,
        avatar: user.avatar,
        bio: user.bio,
        contact: user.contact,
        status: user.status,
        online: user.online,
        skills: user.skills,
        stats: user.stats
      }))
    });

    await prisma.communityPost.createMany({
      data: posts.map((post) => ({
        id: post.id,
        title: post.title,
        type: post.type,
        authorId: post.authorId,
        authorName: post.author,
        authorAvatar: post.authorAvatar,
        category: post.category,
        board: post.board,
        summary: post.summary,
        content: post.content,
        tags: post.tags,
        requiredSkills: post.requiredSkills,
        openSlots: post.openSlots,
        status: post.status,
        moderationStatus: "approved",
        reviewNote: "系统初始化内容。",
        heat: post.heat
      }))
    });

    for (const post of posts) {
      if (post.images.length === 0) continue;
      await prisma.postImage.createMany({
        data: post.images.map((image) => ({
          postId: post.id,
          url: image.url,
          alt: image.alt,
          width: image.width,
          height: image.height
        }))
      });
    }

    await prisma.postComment.createMany({
      data: comments.map((comment) => ({
        id: comment.id,
        postId: comment.postId,
        authorId: comment.authorId,
        authorName: comment.author,
        authorAvatar: comment.authorAvatar,
        content: comment.content,
        moderationStatus: "approved",
        reviewNote: "系统初始化内容。",
        replyTo: comment.replyTo,
        mine: Boolean(comment.mine)
      }))
    });

    await prisma.directMessage.createMany({
      data: messages
        .filter((message) => users.some((user) => user.id === message.senderId))
        .map((message) => ({
          id: message.id,
          conversationId: message.conversationId,
          senderId: message.senderId,
          receiverId: null,
          content: message.content,
          moderationStatus: "approved",
          reviewNote: "系统初始化内容。"
        }))
    });
  }

  const existingTeams = await prisma.teamProject.count();
  if (existingTeams === 0) {
    await prisma.teamProject.createMany({
      data: teams.map((team) => ({
        ...deriveTeamSkills(team),
        id: team.id,
        title: team.title,
        summary: team.summary,
        leaderId: team.leaderId,
        leader: team.leader,
        status: team.status,
        currentCount: team.currentCount,
        maxCount: team.maxCount,
        missingRoles: team.missingRoles,
        tags: team.tags,
        stage: team.stage
      }))
    });
  }

  for (const team of teams) {
    const skills = deriveTeamSkills(team);
    await prisma.teamProject.updateMany({
      where: { id: team.id },
      data: skills
    });
  }

  await ensureOperationalSeed();
}

async function ensureOperationalSeed() {
  const existingRules = await prisma.moderationRule.count();
  if (existingRules === 0) {
    await prisma.moderationRule.createMany({
      data: adminRules.map((rule) => ({
        id: rule.id,
        name: rule.name,
        trigger: rule.trigger,
        action: rule.action,
        enabled: rule.enabled
      }))
    });
  }

  const existingLogs = await prisma.adminAuditLog.count();
  if (existingLogs === 0) {
    await prisma.adminAuditLog.createMany({
      data: adminAuditLogs.map((log) => ({
        admin: log.admin,
        action: log.action,
        target: log.target,
        reason: log.reason
      }))
    });
  }

  const existingColumns = await prisma.editorialColumn.count();
  if (existingColumns === 0) {
    await prisma.editorialColumn.create({
      data: {
        title: "学校官号",
        summary: "学校官方通知、活动入口和校园服务更新统一进入发现页。",
        content: "这里用于发布学校官网、学院活动、比赛报名、系统维护和校园服务类内容。",
        status: "published",
        sortOrder: 1
      }
    });
  }

  const existingAnnouncements = await prisma.announcement.count();
  if (existingAnnouncements === 0) {
    await prisma.announcement.createMany({
      data: [
        {
          title: "挑战杯校内组队开放",
          body: "需要 PPT、答辩、建模、前后端方向的同学可以在组队页发布需求。",
          slot: "discover",
          status: "published"
        },
        {
          title: "项目展示征集",
          body: "欢迎上传项目截图、活动海报和页面预览，首页只展示缩略图，详情页展示完整内容。",
          slot: "discover",
          status: "published"
        }
      ]
    });
  }
}

export function toUser(row: {
  id: string;
  name: string;
  realName: string;
  college: string;
  grade: string;
  direction: string;
  avatar: string;
  bio: string;
  contact: string;
  status: string;
  online: boolean;
  skills: string[];
  stats: unknown;
}): User {
  return {
    id: row.id,
    name: row.name,
    realName: row.realName,
    college: row.college,
    grade: row.grade,
    direction: row.direction,
    avatar: row.avatar,
    bio: row.bio,
    contact: row.contact,
    status: row.status,
    online: row.online,
    skills: row.skills,
    stats: isUserStats(row.stats) ? row.stats : { posts: 0, projects: 0, reputation: 0 }
  };
}

export function toPost(row: {
  id: string;
  title: string;
  type: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  category: string;
  board: string;
  summary: string;
  content: string;
  tags: string[];
  requiredSkills: string[];
  openSlots: number;
  status: string;
  heat: number;
  createdAt: Date;
  images?: Array<{ id: string; url: string; alt: string; width: number; height: number }>;
  comments?: unknown[];
}): Post {
  return {
    id: row.id,
    title: row.title,
    type: row.type as Post["type"],
    authorId: row.authorId,
    author: row.authorName,
    authorAvatar: row.authorAvatar,
    category: row.category,
    board: row.board,
    summary: row.summary,
    content: row.content,
    images: (row.images ?? []).map((image) => ({
      id: image.id,
      url: image.url,
      alt: image.alt,
      width: image.width,
      height: image.height
    })),
    tags: row.tags,
    requiredSkills: row.requiredSkills,
    openSlots: row.openSlots,
    status: row.status,
    createdAt: formatDate(row.createdAt),
    comments: row.comments?.length ?? 0,
    heat: row.heat
  };
}

export function toComment(row: {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: Date;
  replyTo: string | null;
  mine: boolean;
}): Comment {
  return {
    id: row.id,
    postId: row.postId,
    authorId: row.authorId,
    author: row.authorName,
    authorAvatar: row.authorAvatar,
    content: row.content,
    time: formatDate(row.createdAt),
    replyTo: row.replyTo ?? undefined,
    mine: row.mine
  };
}

export function toMessage(row: { id: string; conversationId: string; senderId: string; receiverId?: string | null; content: string; createdAt: Date }): Message {
  return {
    id: row.id,
    conversationId: row.conversationId,
    senderId: row.senderId,
    receiverId: row.receiverId,
    content: row.content,
    time: formatDate(row.createdAt)
  };
}

export function toTeamProject(row: {
  id: string;
  title: string;
  summary: string;
  leaderId: string;
  leader: string;
  status: string;
  currentCount: number;
  maxCount: number;
  missingRoles: string[];
  requiredSkills: string[];
  currentSkills: string[];
  missingSkills: string[];
  tags: string[];
  stage: string;
}): TeamProject {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    leaderId: row.leaderId,
    leader: row.leader,
    status: row.status as TeamProject["status"],
    currentCount: row.currentCount,
    maxCount: row.maxCount,
    missingRoles: row.missingRoles,
    requiredSkills: row.requiredSkills,
    currentSkills: row.currentSkills,
    missingSkills: row.missingSkills,
    tags: row.tags,
    stage: row.stage
  };
}

export function toAdminRule(row: { id: string; name: string; trigger: string; action: string; enabled: boolean }): AdminRule {
  return {
    id: row.id,
    name: row.name,
    trigger: row.trigger,
    action: row.action,
    enabled: row.enabled
  };
}

export function toAuditLog(row: { id: string; admin: string; action: string; target: string; reason: string; createdAt: Date }): AdminAuditLog {
  return {
    id: row.id,
    admin: row.admin,
    action: row.action,
    target: row.target,
    reason: row.reason,
    createdAt: formatDate(row.createdAt)
  };
}

function formatDate(value: Date) {
  return value.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function isUserStats(value: unknown): value is User["stats"] {
  if (!value || typeof value !== "object") return false;
  const target = value as Record<string, unknown>;
  return typeof target.posts === "number" && typeof target.projects === "number" && typeof target.reputation === "number";
}
