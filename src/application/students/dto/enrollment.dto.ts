import type { EnrollmentStatus } from '@/domain/students/models/enrollment.model';

/**
 * Dữ liệu trả về khi gọi thông tin ghi danh
 */
export type EnrollmentResponseDto = {
  id: string;
  studentId: string;
  classId: string;
  status: EnrollmentStatus;
  startDate: string;
  endDate?: string;
  createdAt: string;
};

/**
 * Dữ liệu trả về lịch sử ghi danh
 */
export type EnrollmentHistoryResponseDto = {
  id: string;
  enrollmentId: string;
  fromStatus: EnrollmentStatus;
  toStatus: EnrollmentStatus;
  note?: string;
  changedAt: string;
};

/**
 * Payload để thêm học viên vào lớp
 */
export type CreateEnrollmentRequestDto = {
  studentId: string;
  classId: string;
  startDate: string; // Ngày bắt đầu học
};

/**
 * Payload để cập nhật trạng thái ghi danh (bảo lưu, thôi học, tốt nghiệp...)
 */
export type UpdateEnrollmentStatusRequestDto = {
  status: EnrollmentStatus;
  note?: string; // Lý do thay đổi trạng thái
};

/**
 * Payload để chuyển lớp cho học viên
 */
export type TransferEnrollmentRequestDto = {
  toClassId: string; // Lớp mới muốn chuyển sang
  note?: string; // Ghi chú quyết định chuyển lớp
};
