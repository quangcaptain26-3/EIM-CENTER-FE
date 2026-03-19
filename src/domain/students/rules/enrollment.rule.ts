import type { EnrollmentStatus } from '../models/enrollment.model';
import { ENROLLMENT_STATUS_OPTIONS } from '@/shared/constants/enrollment-status';

/**
 * Lấy nhãn tiếng Việt cho trạng thái ghi danh
 * @param status Trạng thái ghi danh
 * @returns Tên hiển thị tiếng Việt tương ứng
 */
export const getEnrollmentStatusLabel = (status: EnrollmentStatus): string => {
  return ENROLLMENT_STATUS_OPTIONS[status] || status;
};

const MANAGEMENT_ROLES = ['ROOT', 'DIRECTOR', 'ACADEMIC', 'SALES'];

/**
 * Kiểm tra xem người dùng có quyền thêm/sửa học viên không
 * @param userRoles Danh sách vai trò của người dùng
 * @returns true nếu có quyền, ngược lại false
 */
export const canEditStudents = (userRoles: string[] = []): boolean => {
  return userRoles.some(role => MANAGEMENT_ROLES.includes(role));
};

/**
 * Kiểm tra xem người dùng có quyền quản lý lịch sử/trạng thái ghi danh không
 * @param userRoles Danh sách vai trò của người dùng
 * @returns true nếu có quyền, ngược lại false
 */
export const canManageEnrollments = (userRoles: string[] = []): boolean => {
  return userRoles.some(role => MANAGEMENT_ROLES.includes(role));
};

/**
 * Kiểm tra xem một trạng thái ghi danh có được phép chuyển lớp không
 * @param status Trạng thái ghi danh hiện tại
 * @returns true nếu có thể chuyển (ví dụ: đang học, bảo lưu)
 */
export const canTransferEnrollment = (status: EnrollmentStatus): boolean => {
  // Chỉ cho phép chuyển lớp nếu đang học hoặc đang bảo lưu
  return status === 'ACTIVE' || status === 'PAUSED';
};
