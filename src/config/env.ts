import { z } from "zod";
import "dotenv/config";

/**
 * Zod-validated environment variables.
 *
 * Per the Architecture Document and Folder Structure Guide (src/config/),
 * this is the ONLY file that reads process.env directly. The app fails
 * fast on boot with a clear error if any required variable is missing
 * or malformed, rather than surfacing a confusing failure deep in a
 * service file at request time.
 */

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  REDIS_URL: z.string().min(1, "REDIS_URL is required"),

  // JWT signing — RS256 keys per Architecture Document Section 6.1.
  // Stored as base64-encoded PEM strings in env vars (newlines don't
  // survive plain .env files cleanly otherwise).
  JWT_PRIVATE_KEY_BASE64: z.string().min(1, "JWT_PRIVATE_KEY_BASE64 is required"),
  JWT_PUBLIC_KEY_BASE64: z.string().min(1, "JWT_PUBLIC_KEY_BASE64 is required"),
  JWT_ACCESS_TOKEN_TTL: z.string().default("15m"),
  JWT_REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(30),

  CORS_ORIGIN: z.string().default("http://localhost:5173"),

  COOKIE_SECRET: z.string().min(16, "COOKIE_SECRET must be at least 16 characters"),
});

function loadEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const formatted = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    console.error(
      `\n[env] Invalid or missing environment variables:\n${formatted}\n\n` +
        `Check your .env file against .env.example.\n`,
    );
    process.exit(1);
  }

  return parsed.data;
}

export const env = loadEnv();
export const isProd = env.NODE_ENV === "production";
export const isDev = env.NODE_ENV === "development";
export const isTest = env.NODE_ENV === "test";
