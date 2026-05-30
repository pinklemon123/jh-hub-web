import { redis } from "@/lib/redis";
import type { Post } from "@/types";

const POSTS_CACHE_KEY = "posts:latest";
const POSTS_CACHE_TTL_SECONDS = 60;

export async function getCachedPosts() {
  try {
    const value = await redis.get(POSTS_CACHE_KEY);
    return value ? (JSON.parse(value) as Post[]) : null;
  } catch {
    return null;
  }
}

export async function setCachedPosts(posts: Post[]) {
  try {
    await redis.set(POSTS_CACHE_KEY, JSON.stringify(posts), "EX", POSTS_CACHE_TTL_SECONDS);
  } catch {
    // Redis is an optimization here; PostgreSQL remains the source of truth.
  }
}

export async function clearPostsCache() {
  try {
    await redis.del(POSTS_CACHE_KEY);
  } catch {
    // Cache invalidation should not make writes fail.
  }
}
