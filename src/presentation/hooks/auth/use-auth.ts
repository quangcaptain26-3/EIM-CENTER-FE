// use-auth.ts
// Hook đọc trạng thái auth từ Redux store.
// Dùng trong mọi component cần biết user đang đăng nhập hay chưa.

import { useAppSelector } from '@/app/store/hooks';
import { hasRole, hasAnyRole } from '@/domain/auth/rules/auth.rule';

/**
 * Hook tiện ích cho auth state.
 * Trả về user, trạng thái đăng nhập, và các helper kiểm tra role.
 */
export function useAuth() {
  const user          = useAppSelector((s) => s.auth.user);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const initialized   = useAppSelector((s) => s.auth.initialized);

  /** Danh sách roles của user hiện tại */
  const roles = user?.roles ?? [];

  return {
    user,
    isAuthenticated,
    initialized,
    roles,

    /** Kiểm tra user có đúng role không */
    hasRole: (role: string) => hasRole(roles, role),

    /** Kiểm tra user có ít nhất một trong các role không */
    hasAnyRole: (allowedRoles: string[]) => hasAnyRole(roles, allowedRoles),
  };
}
