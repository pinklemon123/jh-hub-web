import { AppShell } from "@/components/app-shell";
import ProfileEditForm from "@/components/profile-edit-form";
import { users } from "@/data/mock";

export default async function EditProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = users.find((u) => u.id === id) ?? users[1];

  return (
    <AppShell>
      <div className="space-y-6">
        <h1 className="text-2xl font-black">编辑资料</h1>
        {/* ProfileEditForm is a client component and will read/save local edits */}
        {/* initialUser is serialized and passed to client */}
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/* @ts-ignore */}
        <ProfileEditForm initialUser={user} />
      </div>
    </AppShell>
  );
}
