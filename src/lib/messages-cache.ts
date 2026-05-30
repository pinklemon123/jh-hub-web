import { redis } from "@/lib/redis";

const MESSAGE_CACHE_TTL_SECONDS = 15;

export function messagesCacheKey(userId: string) {
  return `messages:${userId}`;
}

export async function getCachedMessagesPayload<T>(userId: string) {
  try {
    const value = await redis.get(messagesCacheKey(userId));
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

export async function setCachedMessagesPayload(userId: string, payload: unknown) {
  try {
    await redis.set(messagesCacheKey(userId), JSON.stringify(payload), "EX", MESSAGE_CACHE_TTL_SECONDS);
  } catch {
    // Message cache is only a short-lived read optimization.
  }
}

export async function clearMessagesCache(...userIds: string[]) {
  try {
    await redis.del(...userIds.map(messagesCacheKey));
  } catch {
    // Cache invalidation should not block message delivery.
  }
}
