import type { ApiError } from '@/shared/types/api.type';
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { toast } from 'sonner';

/** Thông điệp cố định theo code — ưu tiên trước `message` từ BE (trừ khi spec ghi "dùng message từ BE"). */
export const ERROR_CODE_MESSAGES: Partial<Record<string, string>> = {
  USER_EMAIL_EXISTS: 'Email này đã được sử dụng',
  CLASS_CAPACITY_EXCEEDED: 'Lớp học đã đủ học viên (tối đa 12)',
  ENROLLMENT_ALREADY_ACTIVE: 'Học viên đang có enrollment hoạt động',
  ATTENDANCE_MAKEUP_BLOCKED: 'Học bù bị khóa vì vắng không phép từ 3 lần',
  PAYROLL_ALREADY_FINALIZED: 'Đã chốt lương tháng này.',
  RECEIPT_ENROLLMENT_REQUIRED: 'Phiếu thu phải gắn với một đăng ký học',
};

export function toApiError(err: unknown): ApiError | null {
  if (!err || typeof err !== 'object') return null;
  const e = err as Partial<ApiError>;
  if (typeof e.httpStatus !== 'number' || typeof e.code !== 'string' || typeof e.message !== 'string') {
    return null;
  }
  return err as ApiError;
}

/** Lỗi validate field từ BE — không hiển thị toast chung; map bằng applyValidationErrorsFromForm. */
export function isValidationError(err: ApiError): boolean {
  return (
    (err.httpStatus === 400 || err.httpStatus === 422) &&
    (err.code === 'VALIDATION_ERROR' || err.code === 'ZOD_ERROR')
  );
}

/** Chi tiết field: object phẳng, hoặc mảng { field/path, message } */
export function extractFieldErrors(details: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (details == null) return out;
  if (Array.isArray(details)) {
    for (const row of details) {
      if (!row || typeof row !== 'object') continue;
      const o = row as Record<string, unknown>;
      const field = (o.field ?? o.path ?? o.param) as string | undefined;
      const msg = (o.message ?? o.msg ?? o.error) as string | undefined;
      if (field && msg) out[String(field)] = String(msg);
    }
    return out;
  }
  if (typeof details === 'object') {
    for (const [k, v] of Object.entries(details as Record<string, unknown>)) {
      if (v == null) continue;
      if (typeof v === 'string') out[k] = v;
      else if (Array.isArray(v) && v.length) out[k] = String(v[0]);
      else if (typeof v === 'object' && v !== null && 'message' in v) {
        out[k] = String((v as { message: unknown }).message);
      }
    }
  }
  return out;
}

/**
 * Map `details` vào RHF setError — dùng trong catch của handleSubmit.
 * @returns true nếu là lỗi validation đã xử lý (kể cả không có field khớp — không toast chung).
 */
export function applyValidationErrorsFromForm<T extends FieldValues>(
  err: unknown,
  setError: UseFormSetError<T>,
): boolean {
  const e = toApiError(err);
  if (!e || !isValidationError(e)) return false;
  const fields = extractFieldErrors(e.details);
  for (const [key, msg] of Object.entries(fields)) {
    setError(key as Path<T>, { type: 'server', message: msg });
  }
  if (Object.keys(fields).length === 0) {
    console.warn('[EIM] VALIDATION_ERROR nhưng không map được field — kiểm tra shape `details`', e);
  }
  return true;
}

export function resolveToastMessage(err: ApiError): string {
  const mapped = ERROR_CODE_MESSAGES[err.code];
  if (mapped) return mapped;
  return err.message.trim() || 'Có lỗi xảy ra';
}

export interface ToastApiErrorOptions {
  /** VD: refetch — khi lỗi mạng */
  onRetry?: () => void;
}

function toastPayrollAlreadyFinalized(err: ApiError) {
  toast.error(resolveToastMessage(err), {
    action: {
      label: 'Xem bảng lương',
      onClick: () => {
        window.location.assign('/payroll');
      },
    },
  });
}

/**
 * Toast thống nhất cho lỗi API (không dùng cho VALIDATION_ERROR — dùng applyValidationErrorsFromForm).
 */
export function toastApiError(err: unknown, options?: ToastApiErrorOptions): void {
  const e = toApiError(err);
  if (!e) {
    toast.error('Có lỗi không xác định');
    return;
  }

  if (isValidationError(e)) {
    console.warn(
      '[EIM] Bỏ qua toast cho VALIDATION_ERROR — dùng applyValidationErrorsFromForm trong form submit.',
      e,
    );
    return;
  }

  if (e.httpStatus === 403) {
    toast.warning('Bạn không có quyền thực hiện thao tác này');
    return;
  }

  if (e.httpStatus === 401) {
    toast.error(resolveToastMessage(e));
    return;
  }

  if (e.code === 'NETWORK_ERROR' || e.httpStatus === 0) {
    toast.error('Không thể kết nối đến server. Vui lòng thử lại.', {
      action: options?.onRetry
        ? { label: 'Thử lại', onClick: () => options.onRetry?.() }
        : { label: 'Tải lại trang', onClick: () => window.location.reload() },
    });
    return;
  }

  if (e.httpStatus >= 500) {
    const rid = e.requestId ?? '';
    console.error('[EIM] Server error', { code: e.code, message: e.message, requestId: rid });
    toast.error('Đã xảy ra lỗi. Vui lòng thử lại hoặc liên hệ kỹ thuật.');
    return;
  }

  if (e.httpStatus === 409 || e.httpStatus === 422) {
    if (e.code === 'PAYROLL_ALREADY_FINALIZED') {
      toastPayrollAlreadyFinalized(e);
      return;
    }
    toast.error(resolveToastMessage(e));
    return;
  }

  toast.error(resolveToastMessage(e));
}
