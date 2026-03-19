import { AppRoles } from "@/shared/constants/roles";

/**
 * Kiểm tra xem người dùng có quyền đọc dữ liệu tài chính không.
 * @param roles Danh sách vai trò của người dùng
 */
export function canReadFinance(roles: string[] | undefined): boolean {
  if (!roles) return false;
  const allowed = [AppRoles.ROOT, AppRoles.DIRECTOR, AppRoles.ACCOUNTANT, AppRoles.ACADEMIC];
  return roles.some(role => allowed.includes(role as any));
}

/**
 * Kiểm tra xem người dùng có quyền ghi (tạo/sửa/xoá) dữ liệu tài chính không.
 * @param roles Danh sách vai trò của người dùng
 */
export function canWriteFinance(roles: string[] | undefined): boolean {
  if (!roles) return false;
  // Chỉ ROOT và ACCOUNTANT mới có quyền ghi
  const allowed = [AppRoles.ROOT, AppRoles.ACCOUNTANT];
  return roles.some(role => allowed.includes(role as any));
}
