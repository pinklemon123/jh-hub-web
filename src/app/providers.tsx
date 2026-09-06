"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { useSessionStore } from "@/store/use-session-store";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  useEffect(() => {
    const refresh = () => fetch("/api/auth/me", { cache: "no-store" })
      .then((response) => { if (!response.ok) throw new Error(); return response.json(); })
      .then((data) => useSessionStore.getState().setUser(data.user ?? null))
      .catch(() => useSessionStore.getState().setUser(null));
    void refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
