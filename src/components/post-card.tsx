import type { Route } from "next";
import { MessageSquare, Radio, Users } from "lucide-react";
import Link from "next/link";
import type { Post } from "@/types";
import { PostImageGrid } from "./post-image-grid";
import { Avatar, Card, Tag } from "./ui";

const typeLabels = {
  TECH: "技术贴",
  TEAM_UP: "组队",
  EVENT: "活动"
};

export function PostCard({ post }: { post: Post }) {
  const postHref = `/posts/${post.id}` as Route;

  return (
    <Card className="p-4 transition-colors hover:border-brand-100">
      <div className="flex gap-3">
        <Link href={`/profile/${post.authorId}` as Route}>
          <Avatar label={post.authorAvatar} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
            <span className="font-bold text-neutral-700">{post.author}</span>
            <span>{post.createdAt}</span>
            <span>
              {post.category} / {post.board}
            </span>
          </div>
          <Link href={postHref} className="block">
            <h2 className="text-lg font-black leading-snug text-ink hover:text-brand-700">{post.title}</h2>
          </Link>
          <p className="mt-2 text-sm leading-6 text-neutral-600">{post.summary}</p>
          <Link href={postHref} className="block">
            <PostImageGrid images={post.images.slice(0, 1)} mode="cover" />
          </Link>
          <div className="mt-3 flex flex-wrap gap-2">
            <Tag className="border-brand-100 bg-brand-50 text-brand-700">{typeLabels[post.type]}</Tag>
            {post.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-semibold text-neutral-500">
            <span className="inline-flex items-center gap-1">
              <MessageSquare size={15} />
              {post.comments} 评论
            </span>
            <span className="inline-flex items-center gap-1">
              <Radio size={15} />
              热度 {post.heat}
            </span>
            {post.openSlots > 0 && (
              <span className="inline-flex items-center gap-1 text-brand-700">
                <Users size={15} />
                还缺 {post.openSlots} 人
              </span>
            )}
            <span className="ml-auto rounded-full bg-paper px-3 py-1 text-neutral-700">{post.status}</span>
            <Link href={postHref} className="font-bold text-brand-700 hover:text-brand-600">
              查看详情
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
