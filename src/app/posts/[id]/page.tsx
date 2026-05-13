import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle, UserPlus } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { CommentThread } from "@/components/comment-thread";
import { PostImageGrid } from "@/components/post-image-grid";
import { PostCard } from "@/components/post-card";
import { ReportButton } from "@/components/report-button";
import { Avatar, Button, Card, Tag } from "@/components/ui";
import { comments as mockComments, posts as mockPosts, users } from "@/data/mock";
import { ensureCommunitySeed, toComment, toPost } from "@/lib/community-db";
import { prisma } from "@/lib/prisma";
import type { Comment, Post, User } from "@/types";

type AuthorSummary = Pick<User, "id" | "name" | "avatar" | "direction" | "bio">;

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const mockPost = mockPosts.find((item) => item.id === id) ?? null;
  let post: Post | null = mockPost;
  let author: AuthorSummary | null = mockPost ? users.find((user) => user.id === mockPost.authorId) ?? null : null;
  let postComments: Comment[] = mockPost ? mockComments.filter((comment) => comment.postId === mockPost.id) : [];
  let relatedPosts: Post[] = mockPost ? mockPosts.filter((item) => item.id !== mockPost.id && item.type === mockPost.type).slice(0, 2) : [];

  try {
    await ensureCommunitySeed();
    const row = await prisma.communityPost.findUnique({
      where: { id },
      include: { images: true, comments: true }
    });

    if (row && row.moderationStatus !== "blocked" && row.moderationStatus !== "rejected") {
      post = toPost(row);
      const dbAuthor = await prisma.hubUser.findUnique({ where: { id: post.authorId } });
      author = dbAuthor
        ? {
            id: dbAuthor.id,
            name: dbAuthor.name,
            avatar: dbAuthor.avatar,
            direction: dbAuthor.direction,
            bio: dbAuthor.bio
          }
        : null;
      postComments = (
        await prisma.postComment.findMany({
          where: { postId: post.id, moderationStatus: { notIn: ["blocked", "rejected"] } },
          orderBy: { createdAt: "asc" }
        })
      ).map(toComment);
      relatedPosts = (
        await prisma.communityPost.findMany({
          where: { id: { not: post.id }, type: post.type, moderationStatus: { notIn: ["blocked", "rejected"] } },
          include: { images: true, comments: true },
          take: 2
        })
      ).map(toPost);
    }
  } catch {
    console.warn("[posts/:id] database unavailable, rendering mock detail");
  }

  if (!post) notFound();
  const candidates = users
    .filter((user) => user.id !== "system" && user.id !== post.authorId)
    .map((user) => {
      const signals = [...post.requiredSkills, ...post.tags];
      const matches = user.skills.filter((skill) => signals.some((signal) => signal.includes(skill) || skill.includes(signal)));
      return { user, matches, score: Math.min(96, 72 + matches.length * 8) };
    })
    .filter((item) => item.matches.length > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return (
    <AppShell>
      <div className="mb-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-brand-700">
          <ArrowLeft size={16} />
          返回内容流
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <main className="space-y-4">
          <Card className="p-5">
            <div className="flex gap-3">
              <Link href={`/profile/${post.authorId}` as Route}>
                <Avatar label={post.authorAvatar} />
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-neutral-500">
                  <Link href={`/profile/${post.authorId}` as Route} className="text-neutral-800 hover:text-brand-700">
                    {post.author}
                  </Link>
                  <span>{post.createdAt}</span>
                  <span>{post.category} / {post.board}</span>
                  <ReportButton targetType="post" targetId={post.id} accusedName={post.author} snapshot={`${post.title}\n${post.content}`} />
                </div>
                <h1 className="mt-3 text-2xl font-black leading-tight text-ink">{post.title}</h1>
                <div className="mt-4 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </div>
                <div className="mt-5 space-y-4 text-sm leading-7 text-neutral-700">
                  {post.content.split("\n").map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                <PostImageGrid images={post.images} />
                <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-line pt-4">
                  <span className="rounded-full bg-paper px-3 py-1 text-xs font-bold text-neutral-700">{post.status}</span>
                  {post.openSlots > 0 && (
                    <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">缺 {post.openSlots} 人</span>
                  )}
                  <Link href="/messages" className="ml-auto">
                    <Button>
                      <MessageCircle size={16} />
                      联系作者
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>

          <CommentThread postId={post.id} initialComments={postComments} />

          {relatedPosts.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-black">相关帖子</h2>
              {relatedPosts.map((item) => (
                <PostCard key={item.id} post={item} />
              ))}
            </section>
          )}
        </main>

        <aside className="space-y-4">
          {author && (
            <Card className="p-4">
              <h2 className="text-sm font-black">作者</h2>
              <div className="mt-3 flex items-center gap-3">
                <Avatar label={author.avatar} />
                <div className="min-w-0">
                  <Link href={`/profile/${author.id}` as Route} className="font-black hover:text-brand-700">
                    {author.name}
                  </Link>
                  <div className="truncate text-xs text-neutral-500">{author.direction}</div>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-neutral-600">{author.bio}</p>
            </Card>
          )}

          <Card className="p-4">
            <h2 className="text-sm font-black">推荐队友</h2>
            <div className="mt-3 space-y-3">
              {candidates.map(({ user, matches, score }) => (
                <div key={user.id} className="rounded-lg border border-line p-3">
                  <div className="flex items-center gap-3">
                    <Avatar label={user.avatar} className="size-9" />
                    <div className="min-w-0 flex-1">
                      <Link href={`/profile/${user.id}` as Route} className="text-sm font-black hover:text-brand-700">
                        {user.name}
                      </Link>
                      <div className="text-xs text-neutral-500">匹配度 {score}</div>
                    </div>
                    <Link href="/messages">
                      <Button size="icon" variant="secondary" aria-label="联系推荐队友">
                        <UserPlus size={15} />
                      </Button>
                    </Link>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {matches.map((skill) => (
                      <Tag key={skill}>{skill}</Tag>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}
