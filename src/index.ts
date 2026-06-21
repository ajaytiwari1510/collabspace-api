import { createApp } from "@/server";
import { env } from "@/config/env";
import { logger } from "@/config/logger";
import { prisma } from "@/config/database";
import { redis } from "@/config/redis";

/**
 * Process entry point. Boots the Express app and wires up graceful
 * shutdown for the Prisma and Redis connections, per Architecture
 * Document Section 7.5 (zero-downtime rolling deploy expectations).
 */
const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`CollabSpace API listening on port ${env.PORT} (${env.NODE_ENV})`);
});

async function shutdown(signal: string): Promise<void> {
  logger.info(`${signal} received — shutting down gracefully`);

  server.close(async () => {
    await prisma.$disconnect();
    redis.disconnect();
    logger.info("Shutdown complete");
    process.exit(0);
  });

  // Force-exit if graceful shutdown hangs
  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10_000).unref();
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
