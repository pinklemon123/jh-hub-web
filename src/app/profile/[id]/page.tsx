import { AppShell } from "@/components/app-shell";
import { PostCard } from "@/components/post-card";
import { ProfilePanel } from "@/components/profile-panel";
import { TeamCard } from "@/components/team-card";
import { teams } from "@/data/mock";
import { ensureCommunitySeed, toPost, toUser } from "@/lib/community-db";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await ensureCommunitySeed();
  const userRow = await prisma.hubUser.findUnique({ where: { id } });
  const fallback = await prisma.hubUser.findFirst({ where: { id: "u_001" } });
  const user = toUser(userRow ?? fallback!);
  const userPosts = (
    await prisma.communityPost.findMany({
      where: { authorId: user.id, moderationStatus: { notIn: ["blocked", "rejected"] } },
      include: { images: true, comments: true },
      orderBy: { createdAt: "desc" }
    })
  ).map(toPost);
  const fallbackPosts = (
    await prisma.communityPost.findMany({
      where: { moderationStatus: { notIn: ["blocked", "rejected"] } },
      include: { images: true, comments: true },
      take: 1
    })
  ).map(toPost);
  const userTeams = teams.filter((team) => team.leaderId === user.id);

  return (
    <AppShell>
      <div className="space-y-6">
        <ProfilePanel user={user} showEdit={user.id === "u_001"} />
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-xl font-black">最近发布</h2>
            {(userPosts.length ? userPosts : fallbackPosts).map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
          <div className="space-y-4">
            <h2 className="text-xl font-black">参与项目</h2>
            {(userTeams.length ? userTeams : teams.slice(0, 1)).map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
