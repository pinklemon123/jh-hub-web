import { AppShell } from "@/components/app-shell";
import { HomeFeed } from "@/components/home-feed";
import { RightRail } from "@/components/right-rail";

export default function HomePage() {
  return (
    <AppShell>
      <div className="flex gap-6">
        <HomeFeed />
        <RightRail />
      </div>
    </AppShell>
  );
}
