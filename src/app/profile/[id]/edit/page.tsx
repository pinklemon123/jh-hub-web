import { AppShell } from "@/components/app-shell";
import ProfileEditForm from "@/components/profile-edit-form";
import { ensureCommunitySeed, toUser } from "@/lib/community-db";
import { prisma } from "@/lib/prisma";

export default async function EditProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await ensureCommunitySeed();
  const userRow = await prisma.hubUser.findUnique({ where: { id } });
  const fallback = await prisma.hubUser.findFirst({ where: { id: "u_001" } });
  const user = toUser(userRow ?? fallback!);

  return (
    <AppShell>
      <div className="space-y-6">
        <h1 className="text-2xl font-black">编辑资料</h1>
        <ProfileEditForm initialUser={user} />
      </div>
    </AppShell>
  );
}
