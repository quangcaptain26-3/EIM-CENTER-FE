// http-error.mapper.ts
// Ánh xạ lỗi catch được thành chuỗi thân thiện với người dùng
// để hiển thị trên Toast notification hoặc Error Boundary.

import axios from 'axios';
import type { ApiErrorResponse } from '@/shared/types/api.type';

type BackendErrorPayload = {
  code?: string;
  message?: string;
  details?: any;
};

function getBackendErrorPayload(error: unknown): BackendErrorPayload | null {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) return null;
  return (error.response?.data?.error ?? null) as BackendErrorPayload | null;
}

function getBackendDetailCode(details: any): string | null {
  // Backend hay nhét `details: { code: 'SOMETHING', ... }`
  if (details && typeof details === 'object' && typeof details.code === 'string') {
    return details.code;
  }
  // Hoặc `details: [{ path, message }]` (zod) -> không có code
  return null;
}

/**
 * Chuyển đổi lỗi bất kỳ thành chuỗi message tiếng Việt để hiển thị cho người dùng.
 * Thứ tự ưu tiên:
 *   1. message do BE trả về trong body (error.message)
 *   2. "Không thể kết nối tới máy chủ." nếu không có response (network error)
 *   3. Fallback chung
 */
export const mapHttpError = (error: unknown): string => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const payload = getBackendErrorPayload(error);
    const detailCode = getBackendDetailCode(payload?.details);

    // === UX-specific: Race condition / permission drift ===
    // Roster drift: roster thay đổi trong lúc đang mở trang
    if (detailCode === 'FEEDBACK_VALIDATION/NOT_IN_ROSTER' || detailCode === 'SCORE_VALIDATION/NOT_IN_ROSTER') {
      return 'Danh sách lớp đã thay đổi. Vui lòng tải lại trang để cập nhật roster rồi thử lại.';
    }

    // Ownership drift / mất quyền giữa chừng
    if (
      detailCode === 'RBAC/TEACHER_SESSION_OWNERSHIP_REQUIRED' ||
      detailCode === 'FEEDBACK_POLICY/TEACHER_NOT_OWNER'
    ) {
      return 'Bạn không còn quyền thao tác buổi học này (có thể đã đổi giáo viên phụ trách). Vui lòng tải lại trang.';
    }

    // R6: Quá hạn chỉnh sửa feedback/điểm
    if (detailCode === 'FEEDBACK/EDIT_DEADLINE_PASSED') {
      return 'Đã quá hạn chỉnh sửa (7 ngày sau buổi học). Liên hệ giáo vụ nếu cần sửa.';
    }

    // Ưu tiên 1: message từ body BE { success: false, error: { message } }
    const serverMessage = error.response?.data?.error?.message;
    if (serverMessage) {
      return serverMessage;
    }

    // Ưu tiên 2: không có response → mất kết nối, timeout, hoặc server không phản hồi
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        return 'Yêu cầu quá thời gian chờ. Vui lòng thử lại.';
      }
      return 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra đường truyền.';
    }

    // Lỗi 500: fallback thân thiện (đã return serverMessage ở trên nếu có)
    if (error.response.status >= 500) {
      return 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau.';
    }

    // 409 Conflict (duplicate)
    if (error.response.status === 409) {
      return 'Dữ liệu trùng lặp. Vui lòng kiểm tra lại.';
    }
  }

  // Ưu tiên 3: lỗi JS thường (Error instance)
  if (error instanceof Error && error.message) {
    return error.message;
  }

  // Fallback cuối
  return 'Có lỗi xảy ra, vui lòng thử lại.';
};

/**
 * Ánh xạ các lỗi validation từ Backend (details array) vào React Hook Form.
 * @param error Lỗi catch được từ API
 * @param setError Hàm setError từ useForm
 */
export const mapValidationErrors = (error: unknown, setError: (name: any, error: any) => void) => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const details = error.response?.data?.error?.details;
    if (Array.isArray(details)) {
      details.forEach((issue: any) => {
        // issue có dạng { path: 'field_name', message: 'error message' } (từ Zod backend)
        if (issue.path) {
          setError(issue.path, {
            type: 'server',
            message: issue.message,
          });
        }
      });
    }
  }
};
