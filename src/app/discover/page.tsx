import { AppShell } from "@/components/app-shell";
import { PostCard } from "@/components/post-card";
import { ProfilePanel } from "@/components/profile-panel";
import { Card, Tag } from "@/components/ui";
import { posts, teams, users } from "@/data/mock";

export default function DiscoverPage() {
  const visibleUsers = users.filter((user) => user.id !== "system");

  return (
    <AppShell>
      <div className="space-y-6">
        <section className="grid gap-4 lg:grid-cols-3">
          <Card className="p-4 lg:col-span-2">
            <h1 className="text-2xl font-black">发现</h1>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              汇总技术标签、活跃项目和推荐同学，让社区更像一个正在发生的校园协作网络。
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["技术讨论", "项目共创", "竞赛互助", "校园公告", "轻内容"].map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
          </Card>
          <Card className="p-4">
            <h2 className="text-sm font-black">活跃项目</h2>
            <div className="mt-3 space-y-3">
              {teams.slice(0, 2).map((team) => (
                <div key={team.id}>
                  <div className="text-sm font-bold">{team.title}</div>
                  <div className="text-xs text-neutral-500">{team.stage}</div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <ProfilePanel user={visibleUsers[1]} />
          <ProfilePanel user={visibleUsers[0]} />
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black">值得参与的讨论</h2>
          {posts.slice(0, 2).map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </section>
      </div>
    </AppShell>
  );
}
