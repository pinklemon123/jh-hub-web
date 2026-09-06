import { getCurrentUser } from "@/lib/user-auth";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { PostCard } from "@/components/post-card";
import { ProfilePanel } from "@/components/profile-panel";
import { TeamCard } from "@/components/team-card";
import { ensureCommunitySeed, toPost, toTeamProject, toUser } from "@/lib/community-db";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await ensureCommunitySeed();
  const userRow = await prisma.hubUser.findUnique({ where: { id } });
  if (!userRow) notFound();
  const user = toUser(userRow);
  const currentUser = await getCurrentUser();
  const userPosts = (
    await prisma.communityPost.findMany({
      where: { authorId: user.id, moderationStatus: "approved" },
      include: { images: true, comments: true },
      orderBy: { createdAt: "desc" }
    })
  ).map(toPost);
  const userTeams = (
    await prisma.teamProject.findMany({
      where: { leaderId: user.id },
      orderBy: { updatedAt: "desc" }
    })
  ).map(toTeamProject);
  return (
    <AppShell>
      <div className="space-y-6">
        <ProfilePanel user={user} showEdit={user.id === currentUser?.id} />
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-xl font-black">最近发布</h2>
            {userPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
          <div className="space-y-4">
            <h2 className="text-xl font-black">参与项目</h2>
            {userTeams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
