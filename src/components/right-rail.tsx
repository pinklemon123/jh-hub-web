import { announcements, hotTags, teams, users } from "@/data/mock";
import { Avatar, Card, Tag } from "./ui";

export function RightRail() {
  const visibleUsers = users.filter((user) => user.id !== "system");

  return (
    <aside className="hidden w-80 shrink-0 space-y-4 xl:block">
      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-black">在线同学</h2>
          <span className="text-xs text-neutral-500">{visibleUsers.filter((user) => user.online).length} 人在线</span>
        </div>
        <div className="space-y-3">
          {visibleUsers.slice(0, 4).map((user) => (
            <div key={user.id} className="flex items-center gap-3">
              <Avatar label={user.avatar} className="size-9" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold">{user.name}</div>
                <div className="truncate text-xs text-neutral-500">{user.direction}</div>
              </div>
              <span className={user.online ? "size-2 rounded-full bg-emerald-500" : "size-2 rounded-full bg-neutral-300"} />
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="mb-3 text-sm font-black">热门技术标签</h2>
        <div className="flex flex-wrap gap-2">
          {hotTags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="mb-3 text-sm font-black">最近组队</h2>
        <div className="space-y-3">
          {teams.map((team) => (
            <div key={team.id} className="border-b border-line pb-3 last:border-0 last:pb-0">
              <div className="text-sm font-bold">{team.title}</div>
              <div className="mt-1 text-xs text-neutral-500">
                缺 {team.missingRoles.join(" / ")} · {team.currentCount}/{team.maxCount}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="mb-3 text-sm font-black">校园公告</h2>
        <div className="space-y-2">
          {announcements.map((item) => (
            <div key={item} className="rounded-lg bg-paper px-3 py-2 text-sm font-semibold text-neutral-700">
              {item}
            </div>
          ))}
        </div>
      </Card>
    </aside>
  );
}
