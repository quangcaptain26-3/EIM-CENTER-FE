/**
 * system.rule.ts
 * Chứa các quy tắc nghiệp vụ (Business Rules) liên quan đến hệ thống.
 * Dùng để kiểm tra quyền hạn UI hoặc format dữ liệu hiển thị.
 */

import type { UserRole } from '@/domain/auth/models/role.model';
import { NotificationType } from '../models/notification.model';

/**
 * Kiểm tra người dùng có quyền xem nhật ký kiểm toán không.
 * Chỉ ROOT và DIRECTOR mới có quyền này.
 */
export const canViewAuditLog = (userRole: UserRole | string): boolean => {
  return userRole === 'ROOT' || userRole === 'DIRECTOR';
};

/**
 * Kiểm tra người dùng có quyền quản lý danh sách user không.
 * Chỉ ROOT mới có quyền quản lý tài khoản nhân viên.
 */
export const canManageUsers = (userRole: UserRole | string): boolean => {
  return userRole === 'ROOT';
};

/**
 * Lấy nhãn tiếng Việt hiển thị cho từng loại thông báo.
 */
export const getNotificationLabel = (type: NotificationType | string): string => {
  switch (type) {
    case NotificationType.OVERDUE_INVOICE:
      return 'Hoá đơn quá hạn';
    case NotificationType.RENEWAL_NEEDED:
      return 'Cần gia hạn học phí';
    case NotificationType.TRIAL_PENDING:
      return 'Học thử mới';
    case NotificationType.SESSION_UNASSIGNED:
      return 'Buổi học chưa gán GV';
    default:
      return 'Thông báo hệ thống';
  }
};
