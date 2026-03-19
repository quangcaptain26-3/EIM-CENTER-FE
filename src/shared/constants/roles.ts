// roles.ts
// Danh sách vai trò (role) chính thức trong hệ thống EIM Center.
// Đây là nguồn chân lý duy nhất – dùng trong RoleGuard, RBAC middleware, và UI logic.

/** Mảng tất cả roles (as const để TypeScript suy ra union type chính xác) */
export const AppRoles = {
  ROOT:          'ROOT',
  DIRECTOR:      'DIRECTOR',
  ACADEMIC:      'ACADEMIC',
  SALES:         'SALES',      // Chỉ tuyển sinh
  ACCOUNTANT:    'ACCOUNTANT', // Chỉ tài chính
  TEACHER:       'TEACHER',
} as const;

/** Union type tất cả roles hợp lệ */
export type AppRole = (typeof AppRoles)[keyof typeof AppRoles];

/**
 * Nhãn hiển thị tiếng Việt tương ứng với từng role.
 * Dùng trong UI (select, badge, tooltip) để hiển thị tên vai trò.
 */
export const roleLabels: Record<AppRole, string> = {
  ROOT:          'Quản trị hệ thống',
  DIRECTOR:      'Giám đốc',
  ACADEMIC:      'Học vụ',
  SALES:         'Nhân viên Sales',
  ACCOUNTANT:    'Kế toán',
  TEACHER:       'Giáo viên',
};
