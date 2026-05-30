import { posts as mockPosts, teams as mockTeams, users as mockUsers } from "@/data/mock";
import { ensureCommunitySeed, toPost, toTeamProject, toUser } from "@/lib/community-db";
import { prisma } from "@/lib/prisma";
import type { Post, TeamProject, User } from "@/types";
import { existsSync } from "node:fs";
import path from "node:path";

export interface OfficialFeedItem {
  id: string;
  title: string;
  body: string;
  type: "学校官号" | "校园公告";
  imageUrl: string | null;
  source: "column" | "announcement";
}

export interface DiscoverData {
  source: "database" | "mock";
  officialFeed: OfficialFeedItem[];
  users: User[];
  teams: TeamProject[];
  posts: Post[];
}

export async function getDiscoverData(): Promise<DiscoverData> {
  try {
    await ensureCommunitySeed();
    const [columnRows, announcementRows, userRows, teamRows, postRows] = await Promise.all([
      prisma.editorialColumn.findMany({
        where: { status: "published" },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        take: 6
      }),
      prisma.announcement.findMany({
        where: { status: "published", slot: { in: ["discover", "home", "carousel"] } },
        orderBy: { createdAt: "desc" },
        take: 8
      }),
      prisma.hubUser.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.teamProject.findMany({ orderBy: { updatedAt: "desc" } }),
      prisma.communityPost.findMany({
        where: { moderationStatus: "approved" },
        include: { images: true, comments: true },
        orderBy: { createdAt: "desc" },
        take: 12
      })
    ]);

    return {
      source: "database",
      officialFeed: [
        ...columnRows.map((item) => ({
          id: item.id,
          title: item.title,
          body: item.summary,
          type: "学校官号" as const,
          imageUrl: validImageUrl(item.coverUrl),
          source: "column" as const
        })),
        ...announcementRows.map((item) => ({
          id: item.id,
          title: item.title,
          body: item.body,
          type: "校园公告" as const,
          imageUrl: validImageUrl(item.imageUrl),
          source: "announcement" as const
        }))
      ],
      users: userRows.map(toUser),
      teams: teamRows.map(toTeamProject),
      posts: postRows.map(toPost)
    };
  } catch {
    console.warn("[discover] database unavailable, rendering mock recommendations");
    return {
      source: "mock",
      officialFeed: [
        {
          id: "mock_school",
          title: "学校官号",
          body: "数据库未连接时显示的占位内容。连接数据库后，这里会展示运营后台发布的学校官方推送和轮播图。",
          type: "学校官号",
          imageUrl: null,
          source: "column"
        }
      ],
      users: mockUsers,
      teams: mockTeams,
      posts: mockPosts
    };
  }
}

function validImageUrl(value: string | null) {
  if (!value) return null;
  if (value.startsWith("data:image/")) return value;
  if (!value.startsWith("/uploads/")) return value;
  return existsSync(path.join(process.cwd(), "public", value)) ? value : null;
}
