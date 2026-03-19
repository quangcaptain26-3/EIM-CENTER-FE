// role.model.ts
// Định nghĩa các vai trò (role) chính thức trong hệ thống EIM Center.
// Là nguồn chân lý duy nhất ở tầng domain – dùng trong RoleGuard và logic phân quyền UI.

/** Union type tất cả roles hợp lệ */
export type UserRole =
  | 'ROOT'
  | 'DIRECTOR'
  | 'ACADEMIC'
  | 'SALES'
  | 'ACCOUNTANT'
  | 'TEACHER';

/** Mảng tất cả giá trị role – dùng để validate hoặc duyệt danh sách */
export const USER_ROLE_VALUES: UserRole[] = [
  'ROOT',
  'DIRECTOR',
  'ACADEMIC',
  'SALES',
  'ACCOUNTANT',
  'TEACHER',
];
