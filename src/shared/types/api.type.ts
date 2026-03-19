// api.type.ts
// Định dạng cấu trúc dữ liệu trả về từ hệ thống Backend (C# .NET) hiện tại.

// Dữ liệu bọc chuẩn khi Success
export interface ApiSuccessResponse<T> {
  success: boolean; // luôn là true
  data: T;
  error: null;
}

// Payload chi tiết của Error trả về
export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: unknown; // Dành cho validation errors
}

// Dữ liệu bọc chuẩn khi Error
export interface ApiErrorResponse {
  success: boolean; // luôn là false
  data: null;
  error: ApiErrorPayload;
}

// Kiểu phân trang chung dùng cho Table, List (tuỳ chỉnh lại sau theo BE thực tế)
export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
}
