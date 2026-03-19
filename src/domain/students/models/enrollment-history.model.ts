import type { EnrollmentStatus } from './enrollment.model';

/**
 * Lịch sử thay đổi trạng thái của ghi danh
 */
export type EnrollmentHistoryModel = {
  id: string; // ID của lịch sử
  enrollmentId: string; // ID của ghi danh liên quan
  fromStatus: EnrollmentStatus; // Trạng thái cũ trước khi đổi
  toStatus: EnrollmentStatus; // Trạng thái mới
  note?: string; // Ghi chú lý do thay đổi trạng thái
  changedAt: string; // Thời gian thay đổi (ISO string)
};
