import type { EnrollmentStatus } from '@/domain/students/models/enrollment.model';

/**
 * Map các tuỳ chọn trạng thái ghi danh với label tiếng Việt
 */
export const ENROLLMENT_STATUS_OPTIONS: Record<EnrollmentStatus, string> = {
  ACTIVE: 'Đang học',
  PAUSED: 'Bảo lưu',
  DROPPED: 'Thôi học',
  TRANSFERRED: 'Chuyển lớp',
  GRADUATED: 'Tốt nghiệp',
};
