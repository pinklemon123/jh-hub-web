import type { Route } from "next";
import Link from "next/link";
import { Building2, MessageSquare, Users } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, Tag } from "@/components/ui";
import { colleges, getCollegeKeyByName } from "@/data/colleges";
import { posts as mockPosts, users as mockUsers } from "@/data/mock";
import { ensureCommunitySeed, toPost, toUser } from "@/lib/community-db";
import { prisma } from "@/lib/prisma";
import type { Post, User } from "@/types";

export const dynamic = "force-dynamic";

const mockUserCollegeKeys = new Map([
  ["u_001", "software"],
  ["u_002", "math"],
  ["u_003", "literature"],
  ["u_004", "electronics"]
]);

async function getCollegePageData(): Promise<{ users: User[]; posts: Post[] }> {
  try {
    await ensureCommunitySeed();
    const [userRows, postRows] = await Promise.all([
      prisma.hubUser.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.communityPost.findMany({
        where: { moderationStatus: "approved" },
        include: { images: true, comments: true },
        orderBy: { createdAt: "desc" }
      })
    ]);
    return { users: userRows.map(toUser), posts: postRows.map(toPost) };
  } catch {
    return { users: mockUsers, posts: mockPosts };
  }
}

export default async function CollegesPage() {
  const { users, posts } = await getCollegePageData();
  const userCollegeKeys = new Map(
    users.map((user) => [user.id, getCollegeKeyByName(user.college) ?? mockUserCollegeKeys.get(user.id)])
  );

  const rankedColleges = colleges
    .map((college) => {
      const memberCount = users.filter((user) => userCollegeKeys.get(user.id) === college.key).length;
      const collegePosts = posts.filter((post) => userCollegeKeys.get(post.authorId) === college.key);
      return {
        ...college,
        memberCount,
        postCount: collegePosts.length,
        latestPosts: collegePosts.slice(0, 3)
      };
    })
    .sort((left, right) => right.postCount + right.memberCount - (left.postCount + left.memberCount));

  return (
    <AppShell>
      <div className="space-y-6">
        <section className="rounded-lg border border-line bg-white p-5 shadow-subtle">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 text-sm font-bold text-brand-700">
                <Building2 size={17} />
                学院专区
              </div>
              <h1 className="text-2xl font-black text-ink">按学院发现帖子、成员和组队机会</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600">
                学院信息统一来自配置文件，后续注册、发帖归属、学院主页和排行榜都可以沿用同一份数据。
              </p>
            </div>
            <Link
              href="/?college=computer"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-600 px-4 text-sm font-bold text-white hover:bg-brand-700"
            >
              查看计算机学院帖子
            </Link>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <Card className="p-4">
            <h2 className="text-sm font-black">本周活跃学院</h2>
            <div className="mt-3 space-y-3">
              {rankedColleges.slice(0, 5).map((college, index) => (
                <div key={college.key} className="flex items-center gap-3">
                  <span className="grid size-7 place-items-center rounded-lg bg-brand-50 text-xs font-black text-brand-700">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold">{college.shortName}</div>
                    <div className="text-xs text-neutral-500">
                      {college.postCount} 篇帖子 · {college.memberCount} 位成员
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 lg:col-span-2">
            <h2 className="text-sm font-black">学院筛选入口</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/" className="rounded-lg bg-brand-600 px-3 py-2 text-xs font-bold text-white">
                全部学院
              </Link>
              {colleges.map((college) => (
                <Link
                  key={college.key}
                  href={`/?college=${college.key}` as Route}
                  className="rounded-lg bg-paper px-3 py-2 text-xs font-bold text-neutral-700 hover:bg-brand-50 hover:text-brand-700"
                >
                  {college.shortName}
                </Link>
              ))}
            </div>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rankedColleges.map((college) => (
            <Card key={college.key} className="flex flex-col p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-ink">{college.label}</h2>
                  <div className="mt-2 space-y-1 text-sm text-neutral-600">
                    <div className="flex items-center gap-2">
                      <Building2 size={15} />
                      {college.office}
                    </div>
                  </div>
                </div>
                <Tag>{college.shortName}</Tag>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 border-y border-line py-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
                  <MessageSquare size={16} />
                  {college.postCount} 篇帖子
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
                  <Users size={16} />
                  {college.memberCount} 位成员
                </div>
              </div>

              <div className="mt-3 min-h-24 flex-1 space-y-2">
                {college.latestPosts.length > 0 ? (
                  college.latestPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/posts/${post.id}` as Route}
                      className="block rounded-lg bg-paper px-3 py-2 text-sm font-semibold text-neutral-700 hover:bg-brand-50 hover:text-brand-700"
                    >
                      {post.title}
                    </Link>
                  ))
                ) : (
                  <div className="rounded-lg bg-paper px-3 py-2 text-sm text-neutral-500">暂无学院帖子</div>
                )}
              </div>

              <Link
                href={`/?college=${college.key}` as Route}
                className="mt-4 inline-flex h-9 items-center justify-center rounded-lg border border-line text-sm font-bold text-brand-700 hover:bg-brand-50"
              >
                只看该学院
              </Link>
            </Card>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
