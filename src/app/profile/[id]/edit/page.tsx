import { getCurrentUser } from "@/lib/user-auth";
import { redirect, notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import ProfileEditForm from "@/components/profile-edit-form";
import { ensureCommunitySeed, toUser } from "@/lib/community-db";
import { prisma } from "@/lib/prisma";

export default async function EditProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect(`/login?next=${encodeURIComponent(`/profile/${id}/edit`)}`);
  if (currentUser.id !== id) notFound();
  await ensureCommunitySeed();
  const userRow = await prisma.hubUser.findUnique({ where: { id } });
  if (!userRow) notFound();
  const user = toUser(userRow);

  return (
    <AppShell>
      <div className="space-y-6">
        <h1 className="text-2xl font-black">编辑资料</h1>
        <ProfileEditForm initialUser={user} />
      </div>
    </AppShell>
  );
}
