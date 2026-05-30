import type { Route } from "next";
import { Lightbulb, MessageSquare, Radio, Rocket, Users } from "lucide-react";
import Link from "next/link";
import type { Post } from "@/types";
import { cn } from "@/lib/utils";
import { PostImageGrid } from "./post-image-grid";
import { ReportButton } from "./report-button";
import { Avatar, Card, Tag } from "./ui";

const typeMeta = {
  TECH: {
    label: "技术分享",
    icon: Lightbulb,
    className: "border-amber-200 bg-amber-50 text-amber-800"
  },
  TEAM_UP: {
    label: "招募队友",
    icon: Rocket,
    className: "border-brand-100 bg-brand-50 text-brand-700"
  },
  EVENT: {
    label: "活动",
    icon: Radio,
    className: "border-sky-200 bg-sky-50 text-sky-800"
  }
};

export function PostCard({ post, collegeLabel }: { post: Post; collegeLabel?: string }) {
  const postHref = `/posts/${post.id}` as Route;
  const meta = typeMeta[post.type];
  const TypeIcon = meta.icon;

  return (
    <Card className="p-4 transition-colors hover:border-neutral-300">
      <div className="flex gap-3">
        <Link href={`/profile/${post.authorId}` as Route}>
          <Avatar label={post.authorAvatar} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
            <span className="font-black text-ink">{post.author}</span>
            <span>{post.createdAt}</span>
            <span>{post.board}</span>
            {collegeLabel && <span className="rounded-full bg-paper px-2 py-0.5 font-bold text-brand-700">{collegeLabel}</span>}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Tag className={cn("min-h-6 gap-1.5 px-2.5", meta.className)}>
              <TypeIcon size={14} />
              {meta.label}
            </Tag>
            {post.openSlots > 0 && (
              <span className="inline-flex min-h-6 items-center gap-1 rounded-full border border-line bg-white px-2.5 text-xs font-bold text-neutral-700">
                <Users size={14} />
                {post.openSlots} 个空位
              </span>
            )}
          </div>

          <Link href={postHref} className="mt-2 block">
            <h2 className="text-lg font-black leading-snug text-ink hover:text-brand-700">{post.title}</h2>
          </Link>
          <p className="mt-2 text-sm leading-6 text-neutral-600">{post.summary}</p>

          {post.type === "TEAM_UP" && post.requiredSkills.length > 0 && (
            <div className="mt-3 rounded-lg border border-line bg-paper p-3">
              <div className="mb-2 text-xs font-black text-neutral-500">需要技能</div>
              <div className="flex flex-wrap gap-2">
                {post.requiredSkills.map((skill) => (
                  <Tag key={skill} className="min-h-6 bg-white px-2.5">
                    {skill}
                  </Tag>
                ))}
              </div>
            </div>
          )}

          <Link href={postHref} className="block">
            <PostImageGrid images={post.images.slice(0, 1)} mode="cover" />
          </Link>

          <div className="mt-3 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Tag key={tag} className="min-h-6 px-2.5">
                {tag}
              </Tag>
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
            <span className="ml-auto rounded-full bg-paper px-3 py-1 text-neutral-700">{post.status}</span>
            <ReportButton
              targetType="post"
              targetId={post.id}
              accusedName={post.author}
              snapshot={`${post.title}\n${post.summary}`}
              compact
            />
            <Link href={postHref} className="font-bold text-brand-700 hover:text-brand-600">
              查看详情
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
