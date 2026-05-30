"use client";

import { SlidersHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { colleges, getCollegeByKey, getCollegeKeyByName } from "@/data/colleges";
import { useHomeData } from "@/hooks/use-home";
import { PostCard } from "./post-card";
import { Button } from "./ui";

const tabs = [
  { label: "全部", value: "all" },
  { label: "最新", value: "latest" },
  { label: "热门", value: "hot" },
  { label: "组队", value: "team" },
  { label: "技术", value: "tech" }
];

const mockAuthorCollegeKeys = new Map([
  ["u_001", "software"],
  ["u_002", "math"],
  ["u_003", "literature"],
  ["u_004", "electronics"]
]);

export function HomeFeed() {
  const { data, isLoading } = useHomeData();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCollege = getCollegeByKey(searchParams.get("college"));
  const [active, setActive] = useState("all");
  const [keyword, setKeyword] = useState("");

  const { posts, authorCollegeLabels } = useMemo(() => {
    const items = data?.posts ?? [];
    const users = data?.sidebar.users ?? [];
    const authorCollegeKeys = new Map(
      users.map((user) => [user.id, getCollegeKeyByName(user.college) ?? mockAuthorCollegeKeys.get(user.id)])
    );
    const authorCollegeLabels = new Map(
      users.map((user) => {
        const collegeKey = authorCollegeKeys.get(user.id);
        return [user.id, colleges.find((college) => college.key === collegeKey)?.shortName ?? user.college];
      })
    );

    const posts = items.filter((post) => {
      const matchTab =
        active === "all" ||
        active === "latest" ||
        (active === "hot" && post.heat > 80) ||
        (active === "team" && post.type === "TEAM_UP") ||
        (active === "tech" && post.type === "TECH");
      const matchCollege = !selectedCollege || authorCollegeKeys.get(post.authorId) === selectedCollege.key;
      const text = `${post.title} ${post.summary} ${post.tags.join(" ")}`;
      return matchTab && matchCollege && text.toLowerCase().includes(keyword.toLowerCase());
    });

    return { posts, authorCollegeLabels };
  }, [active, data?.posts, data?.sidebar.users, keyword, selectedCollege]);

  return (
    <section className="min-w-0 flex-1 space-y-4">
      <div className="rounded-lg border border-line bg-white p-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-black text-ink">{selectedCollege ? `${selectedCollege.label}动态` : "校园协作动态"}</h1>
          </div>
          <Button variant="secondary" className="h-9 px-3">
            <SlidersHorizontal size={16} />
            筛选
          </Button>
        </div>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜索关键词、标签或项目"
            className="h-10 flex-1 rounded-lg border border-line bg-paper px-3 text-sm outline-none focus:border-brand-500"
          />
          <select
            value={selectedCollege?.key ?? ""}
            onChange={(event) => {
              router.push(event.target.value ? `/?college=${event.target.value}` : "/");
            }}
            className="h-10 rounded-lg border border-line bg-paper px-3 text-sm font-semibold text-neutral-700 outline-none focus:border-brand-500"
          >
            <option value="">全部学院</option>
            {colleges.map((college) => (
              <option key={college.key} value={college.key}>
                {college.label}
              </option>
            ))}
          </select>
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActive(tab.value)}
                className={`h-10 shrink-0 rounded-lg px-3 text-sm font-bold ${
                  active === tab.value ? "bg-ink text-white" : "bg-paper text-neutral-600 hover:bg-brand-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-lg border border-line bg-white p-6 text-sm text-neutral-500">正在加载社区内容...</div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} collegeLabel={authorCollegeLabels.get(post.authorId)} />
          ))}
          {posts.length === 0 && (
            <div className="rounded-lg border border-line bg-white p-6 text-sm text-neutral-500">
              暂时没有匹配内容，可以切换学院或关键词。
            </div>
          )}
        </div>
      )}
    </section>
  );
}
