import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import {
  applyValidationErrorsFromForm,
  ERROR_CODE_MESSAGES,
  toastApiError,
  toApiError,
} from '@/shared/lib/api-error';

/**
 * Xử lý lỗi API khi tạo/sửa user (field đặc thù).
 * Trả về `true` nếu đã xử lý (không gọi toastApiError thêm ở catch).
 */
export function handleUserFormApiError<T extends FieldValues>(
  err: unknown,
  setError: UseFormSetError<T>,
): boolean {
  if (applyValidationErrorsFromForm(err, setError)) return true;

  const e = toApiError(err);
  if (e?.code === 'USER_EMAIL_EXISTS') {
    setError('email' as Path<T>, {
      type: 'server',
      message: ERROR_CODE_MESSAGES.USER_EMAIL_EXISTS ?? 'Email này đã được sử dụng',
    });
    return true;
  }

  if (e?.code === 'USER_CODE_EXISTS') {
    toastApiError(err);
    return true;
  }

  return false;
}
