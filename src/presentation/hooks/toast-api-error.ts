/**
 * Re-export xử lý lỗi API thống nhất (toast + validation + map code).
 * @see shared/lib/api-error.ts
 */
import {
  toastApiError as toastApiErrorCore,
  type ToastApiErrorOptions,
} from '@/shared/lib/api-error';

export {
  applyValidationErrorsFromForm,
  toApiError,
  isValidationError,
  resolveToastMessage,
  extractFieldErrors,
  ERROR_CODE_MESSAGES,
  type ToastApiErrorOptions,
} from '@/shared/lib/api-error';

export function toastApiError(err: unknown, options?: ToastApiErrorOptions): void {
  toastApiErrorCore(err, options);
}

/**
 * Dùng cho `useMutation({ onError })` — React Query gọi `(error, variables, context)`;
 * nếu gán trực tiếp `toastApiError` thì `variables` bị nhầm là `options`.
 */
export function mutationToastApiError(err: unknown): void {
  toastApiErrorCore(err);
}
