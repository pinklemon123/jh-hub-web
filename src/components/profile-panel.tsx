import type { User } from "@/types";
import { Avatar, Card, Tag } from "./ui";

export function ProfilePanel({ user }: { user: User }) {
  return (
    <Card className="overflow-hidden">
      <div className="h-28 bg-[linear-gradient(135deg,#6E1F28,#8B2E3A_52%,#1A1A1A)]" />
      <div className="p-5">
        <Avatar label={user.avatar} className="-mt-12 size-20 border-4 border-white text-2xl" />
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black">{user.name}</h1>
            <p className="mt-1 text-sm text-neutral-500">{user.college} · {user.grade} · {user.direction}</p>
          </div>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-bold text-brand-700">{user.status}</span>
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-neutral-700">{user.bio}</p>
        <div className="mt-3 rounded-lg bg-paper px-3 py-2 text-sm font-semibold text-neutral-600">
          联系方式：{user.contact}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {user.skills.map((skill) => (
            <Tag key={skill}>{skill}</Tag>
          ))}
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-4">
          <Stat label="帖子" value={user.stats.posts} />
          <Stat label="项目" value={user.stats.projects} />
          <Stat label="声望" value={user.stats.reputation} />
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
