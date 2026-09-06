import { getCurrentUser } from "@/lib/user-auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { NewPostForm } from "@/components/new-post-form";

export default async function NewPostPage() {
  if (!await getCurrentUser()) redirect("/login?next=%2Fposts%2Fnew");
  return (
    <AppShell>
      <section className="mx-auto max-w-3xl">
        <NewPostForm />
      </section>
    </AppShell>
  );
}
