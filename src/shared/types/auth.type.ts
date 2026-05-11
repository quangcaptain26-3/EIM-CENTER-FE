export type RoleCode = 'ADMIN' | 'ACADEMIC' | 'ACCOUNTANT' | 'TEACHER';

export interface AuthUser {
  id: string;
  userCode: string;
  email: string;
  fullName: string;
  role: RoleCode;
  permissions: string[];
}
