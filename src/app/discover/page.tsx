import { getCurrentUser } from "@/lib/user-auth";
import type { Route } from "next";
import Link from "next/link";
import { Compass, UserPlus, Users } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { OfficialFeedCarousel } from "@/components/official-feed-carousel";
import { PostCard } from "@/components/post-card";
import { Avatar, Button, Card, Tag } from "@/components/ui";
import { getDiscoverData } from "@/lib/discover-data";
import { recommendTeamsForUser, recommendTeammatesForTeams, recommendTechPostsForUser } from "@/lib/recommendations";
import type { Post } from "@/types";

export const dynamic = "force-dynamic";

export default async function DiscoverPage() {
  const data = await getDiscoverData();
  const sessionUser = await getCurrentUser();
  const currentUser = data.users.find((user) => user.id === sessionUser?.id);
  const teamMatches = currentUser ? recommendTeamsForUser(currentUser, data.teams, 3) : [];
  const teammateMatches = currentUser ? recommendTeammatesForTeams(currentUser, data.users, data.teams, 4) : [];
  const techPosts = currentUser ? recommendTechPostsForUser(currentUser, data.posts, 3) : [];

  return (
    <AppShell>
      <div className="space-y-6">
        <section className="grid gap-4 lg:grid-cols-3">
          <Card className="p-5 lg:col-span-2">
            <div className="flex items-start gap-3">
              <div className="grid size-10 place-items-center rounded-lg bg-brand-50 text-brand-700">
                <Compass size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-black">发现</h1>
                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  学校官号、校园公告、项目补位和技术讨论统一从数据库推送，Web 和手机端后面共用同一套接口。
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {["学校官号", "活动轮播", "组队补位", "推荐队友", data.source === "database" ? "数据库" : "占位数据"].map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-black">当前推荐策略</h2>
            <div className="mt-3 space-y-2 text-sm leading-6 text-neutral-600">
              <p>技术贴：按用户技能和帖子标签找相似内容。</p>
              <p>组队贴：按项目缺口找能补位的人。</p>
              <p>运营推送：官号封面和公告图进入轮播。</p>
            </div>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-black">学校官号与校园公告</h2>
              <span className="text-xs font-bold text-neutral-500">{data.officialFeed.length} 条推送</span>
            </div>
            <OfficialFeedCarousel items={data.officialFeed} />
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-brand-700" />
              <h2 className="text-lg font-black">适合你的项目</h2>
            </div>
            <div className="mt-4 space-y-3">
              {teamMatches.map((item) => (
                <article key={item.team.id} className="rounded-lg border border-line p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-black">{item.team.title}</h3>
                      <p className="mt-1 text-xs text-neutral-500">{item.reason}</p>
                    </div>
                    <span className="rounded-md bg-brand-50 px-2 py-1 text-xs font-black text-brand-700">{item.score}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.missingSkills.map((skill) => (
                      <Tag key={skill}>{skill}</Tag>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-black">推荐队友</h2>
            <Link href="/teams">
              <Button variant="secondary" size="sm">
                <Users size={15} />
                去组队页
              </Button>
            </Link>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {teammateMatches.map((item) => (
              <Card key={`${item.team.id}-${item.user.id}`} className="p-4">
                <div className="flex items-start gap-3">
                  <Link href={`/profile/${item.user.id}` as Route}>
                    <Avatar label={item.user.avatar} />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/profile/${item.user.id}` as Route} className="font-black hover:text-brand-700">
                        {item.user.name}
                      </Link>
                      <span className="rounded-md bg-paper px-2 py-1 text-xs font-black text-neutral-600">匹配 {item.score}</span>
                    </div>
                    <p className="mt-1 text-sm text-neutral-500">{item.reason} · {item.team.title}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.matches.slice(0, 5).map((match) => (
                        <Tag key={`${item.user.id}-${match.skill}`}>{match.skill}</Tag>
                      ))}
                    </div>
                  </div>
                  <Link href="/messages">
                    <Button size="icon" variant="secondary" aria-label="联系推荐队友">
                      <UserPlus size={16} />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black">与你相关的技术讨论</h2>
          {techPosts.map((item) => (
            <div key={item.post.id} className="space-y-2">
              <div className="text-xs font-bold text-neutral-500">{item.reason}</div>
              <PostCard post={item.post as Post} />
            </div>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
