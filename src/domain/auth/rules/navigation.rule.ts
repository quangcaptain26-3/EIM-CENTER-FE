/**
 * src/domain/auth/rules/navigation.rule.ts
 * Logic kiểm tra quyền truy cập route.
 */

/**
 * Kiểm tra xem người dùng hiện tại có phân quyền truy cập route không.
 * @param userRoles Danh sách role hiện hành của người dùng
 * @param allowedRoles Nhóm các role được phép truy cập theo khai báo tuyến (route metadata)
 * @returns boolean - true nếu được phép hoặc route public, false nếu không được truy cập
 */
export function canAccessRoute(
  userRoles: string[] | undefined,
  allowedRoles?: string[]
): boolean {
  // Nếu route không yêu cầu role cụ thể, mặc định là ai cũng có thể vào (public)
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }
  
  // Nếu user chưa có bất kỳ role nào nhưng route lại yêu cầu quyền cụ thể -> từ chối
  if (!userRoles || userRoles.length === 0) {
    return false;
  }
  
  // Nếu người dùng có ít nhất 1 role nằm trong danh sách allowed chạy qua mảng -> cho phép
  return allowedRoles.some(role => userRoles.includes(role));
}
