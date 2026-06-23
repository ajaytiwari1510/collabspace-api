import { PrismaClient } from "@prisma/client";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

// Configure WebSockets for Neon
neonConfig.webSocketConstructor = ws;

// Grab the clean URL straight from the environment
const connectionString = process.env.DATABASE_URL as string;

// Initialize the secure connection
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter } as any);

/**
 * Infrastructure verification helper used by the health router
 */
export async function checkDatabaseConnection(): Promise<void> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("🟢 HEALTH CHECK QUERY SUCCESS!");
  } catch (error) {
    console.error("🔴 HEALTH CHECK QUERY FAILED:", error);
    throw error;
  }
}

export { prisma };