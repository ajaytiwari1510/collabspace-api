import Redis from "ioredis";
import { env } from "@/config/env";
import { logger } from "@/config/logger";

/**
 * Singleton ioredis client instance.
 *
 * Used (once the relevant features are built) for: JWT refresh token
 * store, rate limiting, Socket.io adapter, and BullMQ queues — per the
 * Architecture Document. No business logic here, connection setup only.
 */
export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

redis.on("error", (err) => {
  logger.error("Redis connection error", { error: err.message });
});

/**
 * Verifies Redis is reachable. Used by the /health/ready endpoint.
 * Throws if the connection fails — caller is responsible for catching.
 */
export async function checkRedisConnection(): Promise<void> {
  await redis.ping();
}
