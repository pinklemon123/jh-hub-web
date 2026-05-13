import { ArrowRight, Users } from "lucide-react";
import type { TeamProject } from "@/types";
import { Button, Card, Tag } from "./ui";

export function TeamCard({ team }: { team: TeamProject }) {
  const missingSkills = team.missingSkills?.length ? team.missingSkills : team.missingRoles;

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 text-xs font-bold text-brand-700">{team.stage}</div>
          <h2 className="text-lg font-black text-ink">{team.title}</h2>
        </div>
        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
          {team.status === "RECRUITING" ? "招募中" : team.status === "MATCHING" ? "匹配中" : "已关闭"}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-neutral-600">{team.summary}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {team.tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-line pt-4">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-700">
          <Users size={16} />
          {team.currentCount}/{team.maxCount}
        </span>
        <span className="text-sm text-neutral-500">缺：{missingSkills.join(" / ")}</span>
        <Button className="ml-auto" size="sm">
          申请加入
          <ArrowRight size={15} />
        </Button>
      </div>
    </Card>
  );
}
