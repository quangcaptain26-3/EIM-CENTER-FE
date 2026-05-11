import type { AuthUser, RoleCode } from './auth.type';

export type UserStatus = 'active' | 'inactive';

/** Row in users table / list API */
export interface UserListItem {
  id: string;
  userCode: string;
  fullName: string;
  roleCode: RoleCode;
  phone?: string | null;
  cccd?: string | null;
  startDate?: string | null;
  status: UserStatus;
  /** Thâm niên (tháng) — từ BE */
  seniorityMonths?: number | null;
  salaryPerSession?: number | null;
  allowance?: number | null;
}

export interface SalaryLogEntry {
  id: string;
  salaryPerSession?: number | null;
  allowance?: number | null;
  previousSalaryPerSession?: number | null;
  previousAllowance?: number | null;
  reason?: string | null;
  changedAt: string;
  changedByName?: string | null;
}

/** Full staff profile for detail + form */
export interface StaffUserDetail extends UserListItem {
  email?: string | null;
  gender?: string | null;
  dob?: string | null;
  address?: string | null;
  cccd?: string | null;
  nationality?: string | null;
  ethnicity?: string | null;
  religion?: string | null;
  educationLevel?: string | null;
  major?: string | null;
  salaryPerSession?: number | null;
  allowance?: number | null;
}

export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}
