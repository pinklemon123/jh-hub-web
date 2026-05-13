import { NextResponse } from "next/server";
import { getDiscoverData } from "@/lib/discover-data";
import { recommendTeamsForUser, recommendTeammatesForTeams, recommendTechPostsForUser } from "@/lib/recommendations";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") ?? "u_001";
  const data = await getDiscoverData();
  const currentUser = data.users.find((user) => user.id === userId) ?? data.users.find((user) => user.id !== "system") ?? data.users[0];

  return NextResponse.json({
    ok: true,
    source: data.source,
    officialFeed: data.officialFeed,
    recommendations: {
      strategy: "rule_based_skill_matching",
      userId: currentUser?.id,
      teamMatches: currentUser ? recommendTeamsForUser(currentUser, data.teams, 3) : [],
      teammateMatches: currentUser ? recommendTeammatesForTeams(currentUser, data.users, data.teams, 4) : [],
      techPosts: currentUser ? recommendTechPostsForUser(currentUser, data.posts, 3) : []
    }
  });
}
