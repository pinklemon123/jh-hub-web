"use client";

import { create } from "zustand";

interface SessionState {
  activeUserId: string;
  unread: number;
  setActiveUserId: (id: string) => void;
  markAllRead: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  activeUserId: "u_001",
  unread: 2,
  setActiveUserId: (id) => set({ activeUserId: id }),
  markAllRead: () => set({ unread: 0 })
}));
