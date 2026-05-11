import type { UserResponse } from '@/shared/types/api-contract';
import type { AuthUser, RoleCode } from '@/shared/types/auth.type';
import type { StaffUserDetail, UserListItem } from '@/shared/types/user.type';

/** Chuẩn hoá JSON user từ BE → AuthUser trong Redux (role + permissions phẳng). */
export function mapUserResponseToAuthUser(user: UserResponse): AuthUser {
  return {
    id: user.id,
    userCode: user.userCode,
    email: user.email,
    fullName: user.fullName,
    role: user.role.code as RoleCode,
    permissions: user.role.permissions,
  };
}

export function mapUserResponseToListItem(user: UserResponse): UserListItem {
  return {
    id: user.id,
    userCode: user.userCode,
    fullName: user.fullName,
    roleCode: user.role.code as RoleCode,
    phone: user.phone,
    cccd: user.cccd,
    startDate: user.startDate,
    status: user.isActive ? 'active' : 'inactive',
    seniorityMonths: user.seniorityMonths,
    salaryPerSession: user.salaryPerSession,
    allowance: user.allowance,
  };
}

export function mapUserResponseToStaffDetail(user: UserResponse): StaffUserDetail {
  return {
    ...mapUserResponseToListItem(user),
    email: user.email,
    gender: user.gender,
    dob: user.dob,
    address: user.address,
    cccd: user.cccd,
    nationality: user.nationality,
    ethnicity: user.ethnicity,
    religion: user.religion,
    educationLevel: user.educationLevel,
    major: user.major,
    salaryPerSession: user.salaryPerSession,
    allowance: user.allowance,
  };
}
