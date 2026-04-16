/** Lỗi chuẩn hóa từ backend (hoặc client) */
export interface NormalizedApiError {
  code: string;
  message: string;
  details?: unknown;
}

/** Dùng trong interceptor / catch — thêm HTTP status */
export interface ApiError extends NormalizedApiError {
  httpStatus: number;
  /** request_id từ BE (khi có) — log khi 500 */
  requestId?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PagedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
