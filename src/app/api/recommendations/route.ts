import { getCurrentUser } from "@/lib/user-auth";
import { NextResponse } from "next/server";
import { ensureCommunitySeed, toPost, toTeamProject, toUser } from "@/lib/community-db";
import { prisma } from "@/lib/prisma";
import { recommendTeamsForUser, recommendTeammatesForTeams, recommendTechPostsForUser } from "@/lib/recommendations";

export async function GET(request: Request) {
  await ensureCommunitySeed();
  const userId = (await getCurrentUser())?.id;

  const [userRows, teamRows, postRows] = await Promise.all([
    prisma.hubUser.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.teamProject.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.communityPost.findMany({
      where: { moderationStatus: "approved" },
      include: { images: true, comments: true },
      orderBy: { createdAt: "desc" }
    })
  ]);

  const users = userRows.map(toUser);
  const teams = teamRows.map(toTeamProject);
  const posts = postRows.map(toPost);
  const currentUser = users.find((user) => user.id === userId);

  return NextResponse.json({
    ok: true,
    strategy: "rule_based_skill_matching",
    userId: currentUser?.id,
    teamMatches: currentUser ? recommendTeamsForUser(currentUser, teams) : [],
    teammateMatches: currentUser ? recommendTeammatesForTeams(currentUser, users, teams) : [],
    techPosts: currentUser ? recommendTechPostsForUser(currentUser, posts) : []
  });
}
