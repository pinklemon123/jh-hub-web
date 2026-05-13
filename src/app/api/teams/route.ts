import { NextResponse } from "next/server";
import { ensureCommunitySeed, toTeamProject } from "@/lib/community-db";
import { prisma } from "@/lib/prisma";

function stringArray(value: unknown) {
  return Array.isArray(value) ? [...new Set(value.map(String).map((item) => item.trim()).filter(Boolean))] : [];
}

function calculateMissingSkills(requiredSkills: string[], currentSkills: string[], fallback: string[]) {
  const normalizedCurrent = new Set(currentSkills.map((item) => item.toLowerCase()));
  const missing = requiredSkills.filter((skill) => !normalizedCurrent.has(skill.toLowerCase()));
  return missing.length > 0 ? missing : fallback;
}

export async function GET() {
  await ensureCommunitySeed();
  const rows = await prisma.teamProject.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ ok: true, items: rows.map(toTeamProject) });
}

export async function POST(request: Request) {
  await ensureCommunitySeed();
  const body = await request.json();
  const tags = stringArray(body.tags);
  const missingRoles = stringArray(body.missingRoles);
  const currentSkills = stringArray(body.currentSkills);
  const requiredSkills = stringArray(body.requiredSkills).length > 0 ? stringArray(body.requiredSkills) : [...new Set([...tags, ...missingRoles])];
  const missingSkills = stringArray(body.missingSkills).length > 0 ? stringArray(body.missingSkills) : calculateMissingSkills(requiredSkills, currentSkills, missingRoles);
  const row = await prisma.teamProject.create({
    data: {
      id: String(body.id ?? `t_${Date.now()}`),
      title: String(body.title ?? ""),
      summary: String(body.summary ?? ""),
      leaderId: String(body.leaderId ?? "u_001"),
      leader: String(body.leader ?? "镜湖大懒猫"),
      status: String(body.status ?? "RECRUITING"),
      currentCount: Number(body.currentCount ?? 1),
      maxCount: Number(body.maxCount ?? 5),
      missingRoles,
      requiredSkills,
      currentSkills,
      missingSkills,
      tags,
      stage: String(body.stage ?? "")
    }
  });
  return NextResponse.json({ ok: true, item: toTeamProject(row) });
}
