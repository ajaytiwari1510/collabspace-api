/**
 * Generic API response envelope types — backend side.
 *
 * Mirrors collabspace-web/src/types/api.types.ts exactly. Per the
 * Folder Structure Guide, Section 4.3, these are hand-synced across
 * the two repos at this project stage; keep both files in lockstep
 * when this contract changes.
 */

export interface PaginationMeta {
  total: number;
  nextCursor: string | null;
  hasMore: boolean;
}

export interface ApiErrorDetail {
  field: string;
  message: string;
}

export interface ApiSuccessBody<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
  };
}
