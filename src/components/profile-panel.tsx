"use client";

import { MessageCircle } from "lucide-react";
import Link from "next/link";
import type { User } from "@/types";
import { Avatar, Card, Tag } from "./ui";

export function ProfilePanel({ user, showEdit }: { user: User; showEdit?: boolean }) {
  const displayUser = user;

  return (
    <Card className="overflow-hidden">
      <div className="h-28 bg-[linear-gradient(135deg,#6E1F28,#8B2E3A_52%,#1A1A1A)]" />
      <div className="p-5">
        <Avatar label={displayUser.avatar} className="-mt-12 size-20 border-4 border-white text-2xl" />
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black">{displayUser.name}</h1>
            <p className="mt-1 text-sm text-neutral-500">
              {displayUser.college} · {displayUser.grade} · {displayUser.direction}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-bold text-brand-700">{displayUser.status}</span>
            {showEdit ? (
              <Link href={`/profile/${displayUser.id}/edit`} className="rounded-md bg-black px-3 py-1 text-sm font-semibold text-white">
                编辑资料
              </Link>
            ) : (
              <Link
                href={`/messages?targetId=${displayUser.id}`}
                className="inline-flex h-8 items-center gap-2 rounded-md bg-black px-3 text-sm font-semibold text-white"
              >
                <MessageCircle size={15} />
                私信
              </Link>
            )}
          </div>
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-neutral-700">{displayUser.bio}</p>
        <div className="mt-3 rounded-lg bg-paper px-3 py-2 text-sm font-semibold text-neutral-600">
          联系方式：{displayUser.contact}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {displayUser.skills.map((skill) => (
            <Tag key={skill}>{skill}</Tag>
          ))}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-4">
          <Stat label="帖子" value={displayUser.stats.posts} />
          <Stat label="项目" value={displayUser.stats.projects} />
        </div>
      </div>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-xl font-black text-ink">{value}</div>
      <div className="text-xs font-semibold text-neutral-500">{label}</div>
    </div>
  );
}
