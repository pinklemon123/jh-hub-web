import { NextResponse } from "next/server";
import { ensureCommunitySeed, toTeamProject } from "@/lib/community-db";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await ensureCommunitySeed();
  const rows = await prisma.teamProject.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ ok: true, items: rows.map(toTeamProject) });
}

export async function POST(request: Request) {
  await ensureCommunitySeed();
  const body = await request.json();
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
      missingRoles: Array.isArray(body.missingRoles) ? body.missingRoles.map(String) : [],
      tags: Array.isArray(body.tags) ? body.tags.map(String) : [],
      stage: String(body.stage ?? "")
    }
  });
  return NextResponse.json({ ok: true, item: toTeamProject(row) });
}
