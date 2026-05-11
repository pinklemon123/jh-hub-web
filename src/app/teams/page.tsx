import { AppShell } from "@/components/app-shell";
import { TeamCard } from "@/components/team-card";
import { Card, Tag } from "@/components/ui";
import { teams } from "@/data/mock";

export default function TeamsPage() {
  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="space-y-4">
          <div className="rounded-lg border border-line bg-white p-5 shadow-subtle">
            <h1 className="text-2xl font-black">组队广场</h1>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              这里不做招聘网站，只展示兴趣项目、当前进度、缺什么角色和如何联系。
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["招募中", "竞赛", "课程项目", "校园工具", "可长期维护"].map((item) => (
                <Tag key={item}>{item}</Tag>
              ))}
            </div>
          </div>
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </section>

        <aside className="space-y-4">
          <Card className="p-4">
            <h2 className="text-sm font-black">推荐发布格式</h2>
            <div className="mt-3 space-y-3 text-sm leading-6 text-neutral-600">
              <p>项目：校园地图系统</p>
              <p>缺：后端 / UI / Flutter</p>
              <p>当前：3 人，原型已完成</p>
              <p>状态：招募中，可先私信了解</p>
            </div>
          </Card>
          <Card className="p-4">
            <h2 className="text-sm font-black">活跃方向</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {["Next.js", "Flutter", "AI", "数学建模", "PPT", "后端"].map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}
