import { AppShell } from "@/components/app-shell";
import { PostCard } from "@/components/post-card";
import { ProfilePanel } from "@/components/profile-panel";
import { TeamCard } from "@/components/team-card";
import { posts, teams, users } from "@/data/mock";

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = users.find((item) => item.id === id) ?? users[1];
  const userPosts = posts.filter((post) => post.authorId === user.id);
  const userTeams = teams.filter((team) => team.leaderId === user.id);

  return (
    <AppShell>
      <div className="space-y-6">
        <ProfilePanel user={user} />
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-xl font-black">最近帖子</h2>
            {(userPosts.length ? userPosts : posts.slice(0, 1)).map((post) => (
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
