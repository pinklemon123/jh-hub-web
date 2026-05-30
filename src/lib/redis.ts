import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis?: Redis;
};

function createRedisClient() {
  const redisUrl = process.env.REDIS_URL;
  const client = redisUrl
    ? new Redis(redisUrl, redisOptions())
    : new Redis({
        host: process.env.REDIS_HOST ?? "127.0.0.1",
        port: Number(process.env.REDIS_PORT ?? 6379),
        ...redisOptions()
      });

  client.on("error", (error) => {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[redis] unavailable:", error.message);
    }
  });

  return client;
}

function redisOptions() {
  return {
    connectTimeout: 1000,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1
  };
}

export const redis = globalForRedis.redis ?? createRedisClient();

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}
