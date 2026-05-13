import { comments, messages, posts, users } from "@/data/mock";
import type { Comment, Message, Post, User } from "@/types";
import { prisma } from "@/lib/prisma";

export async function ensureCommunitySeed() {
  const existingUsers = await prisma.hubUser.count();
  if (existingUsers > 0) return;

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
        content: message.content
      }))
  });
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

export function toMessage(row: { id: string; conversationId: string; senderId: string; content: string; createdAt: Date }): Message {
  return {
    id: row.id,
    conversationId: row.conversationId,
    senderId: row.senderId,
    content: row.content,
    time: formatDate(row.createdAt)
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
