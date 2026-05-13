import { announcements as mockAnnouncements, hotTags as mockHotTags, teams as mockTeams, users as mockUsers } from "@/data/mock";
import { ensureCommunitySeed, toTeamProject, toUser } from "@/lib/community-db";
import { prisma } from "@/lib/prisma";
import { Avatar, Card, Tag } from "./ui";

async function getRailData() {
  try {
    await ensureCommunitySeed();
    const [userRows, teamRows, postRows, announcementRows] = await Promise.all([
      prisma.hubUser.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.teamProject.findMany({ orderBy: { updatedAt: "desc" }, take: 4 }),
      prisma.communityPost.findMany({
        where: { moderationStatus: "approved" },
        select: { tags: true },
        orderBy: { createdAt: "desc" },
        take: 20
      }),
      prisma.announcement.findMany({
        where: { status: "published" },
        orderBy: { createdAt: "desc" },
        take: 4
      })
    ]);
    const users = userRows.map(toUser);
    const teams = teamRows.map(toTeamProject);
    const hotTags = [...new Set([...postRows.flatMap((post) => post.tags), ...teams.flatMap((team) => team.tags)])].slice(0, 8);
    return {
      users,
      teams,
      hotTags: hotTags.length ? hotTags : mockHotTags,
      announcements: announcementRows.map((item) => item.title)
    };
  } catch {
    console.warn("[right-rail] database unavailable, rendering mock sidebar");
    return { users: mockUsers, teams: mockTeams, hotTags: mockHotTags, announcements: mockAnnouncements };
  }
}

export async function RightRail() {
  const { users, teams, hotTags, announcements } = await getRailData();
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
          {teams.map((team) => {
            const missingSkills = team.missingSkills?.length ? team.missingSkills : team.missingRoles;
            return (
              <div key={team.id} className="border-b border-line pb-3 last:border-0 last:pb-0">
                <div className="text-sm font-bold">{team.title}</div>
                <div className="mt-1 text-xs text-neutral-500">
                  缺 {missingSkills.join(" / ")} · {team.currentCount}/{team.maxCount}
                </div>
              </div>
            );
          })}
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
