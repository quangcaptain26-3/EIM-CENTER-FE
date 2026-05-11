/**
 * Redirect mặc định sau đăng nhập / khi vào `/`.
 */
import { RoutePaths } from './route-paths';
import { ROLES } from '@/shared/constants/roles';

export function getDefaultRedirectForRole(roles?: string[]): string {
  if (!roles || roles.length === 0) return RoutePaths.DASHBOARD;

  if (roles.includes(ROLES.ACCOUNTANT)) return RoutePaths.FINANCE_DASHBOARD;
  if (roles.includes(ROLES.TEACHER)) return RoutePaths.MY_SESSIONS;

  return RoutePaths.DASHBOARD;
}
