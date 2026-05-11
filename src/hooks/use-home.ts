"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";

export function useHomeData() {
  return useQuery({
    queryKey: ["home"],
    queryFn: async () => {
      const [posts, sidebar] = await Promise.all([api.getPosts(), api.getSidebar()]);
      return { posts, sidebar };
    }
  });
}
