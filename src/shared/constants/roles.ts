export const ROLES = {
  ADMIN: 'ADMIN',
  ACADEMIC: 'ACADEMIC',
  ACCOUNTANT: 'ACCOUNTANT',
  TEACHER: 'TEACHER',
} as const;

export type RoleCode = keyof typeof ROLES;

/**
 * Alias role dùng trong router cũ — giá trị là mã role thật từ BE (một trong 4 role).
 */
export const AppRoles = {
  ...ROLES,
  ROOT: ROLES.ADMIN,
  DIRECTOR: ROLES.ADMIN,
  SALES: ROLES.ACADEMIC,
} as const;

export type AppRoleValue = (typeof AppRoles)[keyof typeof AppRoles];

/** Kiểu role dùng trong route-meta (cùng tập giá trị với BE). */
export type AppRole = AppRoleValue;
