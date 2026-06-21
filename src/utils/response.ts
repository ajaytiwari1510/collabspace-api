import type { Response } from "express";
import type { ApiSuccessBody, PaginationMeta } from "@/types/api.types";

/**
 * Builds and sends a standard success response envelope.
 * Per Folder Structure Guide, src/utils/response.ts.
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  options?: { statusCode?: number; meta?: PaginationMeta },
): void {
  const body: ApiSuccessBody<T> = { success: true, data };
  if (options?.meta) {
    body.meta = options.meta;
  }
  res.status(options?.statusCode ?? 200).json(body);
}
