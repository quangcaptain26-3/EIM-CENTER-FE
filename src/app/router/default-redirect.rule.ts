/**
 * Quy tắc redirect mặc định theo role.
 * Dùng sau login và khi truy cập / (root).
 * Mỗi role có trang làm việc chính riêng → tránh chuyển hướng "xàm".
 */
import { RoutePaths } from './route-paths';
import { AppRoles } from '@/shared/constants/roles';

/**
 * Lấy đường dẫn redirect mặc định theo roles của user.
 * Ưu tiên: SALES → Tuyển sinh, ACCOUNTANT → Hóa đơn, TEACHER → Buổi học của tôi, còn lại → Tổng quan.
 */
export function getDefaultRedirectForRole(roles?: string[]): string {
  if (!roles || roles.length === 0) return RoutePaths.DASHBOARD;

  // Ưu tiên theo công việc chính của từng role
  if (roles.includes(AppRoles.SALES)) return RoutePaths.TRIALS;
  if (roles.includes(AppRoles.ACCOUNTANT)) return RoutePaths.INVOICES;
  if (roles.includes(AppRoles.TEACHER)) return RoutePaths.MY_SESSIONS;

  return RoutePaths.DASHBOARD;
}
