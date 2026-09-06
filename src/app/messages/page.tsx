import { getCurrentUser } from "@/lib/user-auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { MessageCenter } from "@/components/message-center";

export default async function MessagesPage() {
  if (!await getCurrentUser()) redirect("/login?next=%2Fmessages");
  return (
    <AppShell>
      <Suspense fallback={<div role="status">正在加载私信…</div>}>
        <MessageCenter />
      </Suspense>
    </AppShell>
  );
}
