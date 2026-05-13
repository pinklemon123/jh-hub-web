import { AppShell } from "@/components/app-shell";
import { NewPostForm } from "@/components/new-post-form";

export default function NewPostPage() {
  return (
    <AppShell>
      <section className="mx-auto max-w-3xl">
        <NewPostForm />
      </section>
    </AppShell>
  );
}
