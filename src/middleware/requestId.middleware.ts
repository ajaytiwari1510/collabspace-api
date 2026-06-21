import { randomUUID } from "node:crypto";
import type { Request, Response, NextFunction } from "express";

/**
 * Attaches a unique ID to every incoming request, used for log
 * correlation. Must be registered before any other middleware that
 * logs (per Architecture Document Section 7.4).
 */
export function requestId(req: Request, res: Response, next: NextFunction): void {
  req.requestId = randomUUID();
  res.setHeader("X-Request-Id", req.requestId);
  next();
}
