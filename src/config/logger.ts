import winston from "winston";
import { isProd } from "@/config/env";

/**
 * Structured JSON logger, per Architecture Document Section 7.4.
 *
 * Format: { timestamp, level, message, ...meta }
 * Console transport only for now — file rotation / Papertrail transport
 * is added when deploying past local development (see Architecture Doc,
 * Section 7.5).
 */
export const logger = winston.createLogger({
  level: isProd ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    isProd ? winston.format.json() : winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
    ),
  ),
  transports: [new winston.transports.Console()],
});
