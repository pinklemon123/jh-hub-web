import type { ReactNode } from "react";
import { Suspense } from "react";
import { TopNav } from "./top-nav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <TopNav />
      </Suspense>
      <main className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6">{children}</main>
    </>
  );
}
