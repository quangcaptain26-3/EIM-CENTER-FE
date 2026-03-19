// auth.rule.ts
// Các hàm helper kiểm tra phân quyền ở tầng domain.
// Không phụ thuộc framework – dùng được ở cả guard, hook, và UI logic.

/**
 * Kiểm tra user có role cụ thể không.
 * @param userRoles - Danh sách roles của user
 * @param role - Role cần kiểm tra
 */
export function hasRole(
  userRoles: string[] | undefined,
  role: string
): boolean {
  if (!userRoles || userRoles.length === 0) return false;
  return userRoles.includes(role);
}

/**
 * Kiểm tra user có ít nhất một trong các roles cho phép không.
 * Dùng khi một route/feature cho phép nhiều role truy cập.
 * @param userRoles - Danh sách roles của user
 * @param allowedRoles - Tập roles được phép
 */
export function hasAnyRole(
  userRoles: string[] | undefined,
  allowedRoles: string[]
): boolean {
  if (!userRoles || userRoles.length === 0) return false;
  return allowedRoles.some((role) => userRoles.includes(role));
}

/**
 * Kiểm tra user có permission cụ thể không.
 * @param permissions - Danh sách permissions của user
 * @param permission - Permission cần kiểm tra
 */
export function hasPermission(
  permissions: string[] | undefined,
  permission: string
): boolean {
  if (!permissions || permissions.length === 0) return false;
  return permissions.includes(permission);
}
