"use client";

import { SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { useHomeData } from "@/hooks/use-home";
import { Button } from "./ui";
import { PostCard } from "./post-card";

const tabs = ["全部", "最新", "热门", "组队", "技术"];

export function HomeFeed() {
  const { data, isLoading } = useHomeData();
  const [active, setActive] = useState("全部");
  const [keyword, setKeyword] = useState("");

  const posts = useMemo(() => {
    const items = data?.posts ?? [];
    return items.filter((post) => {
      const matchTab =
        active === "全部" ||
        active === "最新" ||
        (active === "热门" && post.heat > 80) ||
        (active === "组队" && post.type === "TEAM_UP") ||
        (active === "技术" && post.type === "TECH");
      const text = `${post.title} ${post.summary} ${post.tags.join(" ")}`;
      return matchTab && text.toLowerCase().includes(keyword.toLowerCase());
    });
  }, [active, data?.posts, keyword]);

  return (
    <section className="min-w-0 flex-1 space-y-4">
      <div className="rounded-lg border border-line bg-white p-4 shadow-subtle">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-black text-ink">校园协作动态</h1>
            <p className="mt-1 text-sm text-neutral-500">帖子、组队、项目联系和技术讨论都在同一条内容流里。</p>
          </div>
          <Button variant="secondary">
            <SlidersHorizontal size={16} />
            筛选
          </Button>
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜索关键词、标签或项目"
            className="h-11 flex-1 rounded-lg border border-line bg-paper px-4 text-sm outline-none focus:border-brand-500"
          />
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActive(tab)}
                className={`h-11 shrink-0 rounded-lg px-4 text-sm font-bold ${
                  active === tab ? "bg-brand-600 text-white" : "bg-paper text-neutral-600 hover:bg-brand-50"
                }`}
              >
                {tab}
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
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </section>
  );
}
