import { getCurrentUser } from "@/lib/user-auth";
import { NextResponse } from "next/server";
import { getDiscoverData } from "@/lib/discover-data";
import { recommendTeamsForUser, recommendTeammatesForTeams, recommendTechPostsForUser } from "@/lib/recommendations";

export async function GET(request: Request) {
  const userId = (await getCurrentUser())?.id;
  const data = await getDiscoverData();
  const currentUser = data.users.find((user) => user.id === userId);

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
