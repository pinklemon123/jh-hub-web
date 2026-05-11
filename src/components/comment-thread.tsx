"use client";

import { Reply, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { Comment } from "@/types";
import { Avatar, Button } from "./ui";

export function CommentThread({ postId, initialComments }: { postId: string; initialComments: Comment[] }) {
  const [comments, setComments] = useState(initialComments);
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<Comment | null>(null);

  const sortedComments = useMemo(() => comments, [comments]);

  function submitComment() {
    const trimmed = content.trim();
    if (!trimmed) return;

    setComments((current) => [
      ...current,
      {
        id: `local_${Date.now()}`,
        postId,
        authorId: "u_001",
        author: "镜湖大懒猫",
        authorAvatar: "林",
        content: trimmed,
        time: "刚刚",
        replyTo: replyTo?.author,
        mine: true
      }
    ]);
    setContent("");
    setReplyTo(null);
  }

  return (
    <section className="rounded-lg border border-line bg-white p-5 shadow-subtle">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-black">评论</h2>
        <span className="text-sm text-neutral-500">{comments.length} 条讨论</span>
      </div>

      <div className="space-y-4">
        {sortedComments.map((comment) => (
          <article key={comment.id} className="flex gap-3 border-b border-line pb-4 last:border-0 last:pb-0">
            <Avatar label={comment.authorAvatar} className="size-9" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-black">{comment.author}</span>
                <span className="text-xs text-neutral-500">{comment.time}</span>
                {comment.replyTo && (
                  <span className="rounded-full bg-paper px-2 py-1 text-xs font-semibold text-neutral-500">
                    回复 {comment.replyTo}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm leading-6 text-neutral-700">{comment.content}</p>
              <div className="mt-2 flex gap-2">
                <button
                  className="inline-flex items-center gap-1 text-xs font-bold text-neutral-500 hover:text-brand-700"
                  onClick={() => setReplyTo(comment)}
                >
                  <Reply size={14} />
                  回复
                </button>
                {comment.mine && (
                  <button
                    className="inline-flex items-center gap-1 text-xs font-bold text-neutral-500 hover:text-brand-700"
                    onClick={() => setComments((current) => current.filter((item) => item.id !== comment.id))}
                  >
                    <Trash2 size={14} />
                    删除
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-5 rounded-lg border border-line bg-paper p-3">
        {replyTo && (
          <div className="mb-2 flex items-center justify-between text-xs font-semibold text-neutral-500">
            <span>回复 {replyTo.author}</span>
            <button onClick={() => setReplyTo(null)} className="text-brand-700">
              取消
            </button>
          </div>
        )}
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className="min-h-24 w-full resize-y rounded-lg border border-line bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-brand-500"
          placeholder="写下你的建议、问题或协作意向"
        />
        <div className="mt-3 flex justify-end">
          <Button onClick={submitComment}>发送评论</Button>
        </div>
      </div>
    </section>
  );
}
