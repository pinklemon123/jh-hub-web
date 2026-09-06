"use client";
import { create } from "zustand";
import type { User } from "@/types";
interface SessionState {
  user: User | null;
  activeUserId: string;
  loading: boolean;
  unread: number;
  setUser: (user: User | null) => void;
  markAllRead: () => void;
}
export const useSessionStore = create<SessionState>((set) => ({
  user: null, activeUserId: "", loading: true, unread: 0,
  setUser: (user) => set({ user, activeUserId: user?.id ?? "", loading: false, unread: 0 }),
  markAllRead: () => set({ unread: 0 })
}));
