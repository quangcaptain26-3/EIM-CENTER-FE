import type { EnrollmentStatus } from '@/domain/students/models/enrollment.model';

/**
 * Tóm tắt chuyên cần (gắn enrollment khi includeAttendanceSummary=true)
 */
export type AttendanceSummaryDto = {
  absentCount: number;
  totalSessions: number;
  warningThreshold: number;
  isAtRisk: boolean;
};

/**
 * Dữ liệu trả về khi gọi thông tin ghi danh
 */
export type EnrollmentResponseDto = {
  id: string;
  studentId: string;
  classId: string | null;
  classCode?: string | null;
  programId?: string | null; // Từ class — filter chuyển lớp cùng chương trình
  status: EnrollmentStatus;
  startDate: string;
  endDate?: string;
  createdAt: string;
  attendanceSummary?: AttendanceSummaryDto;
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
 * Payload để thêm học viên vào lớp.
 * classId có thể null khi chưa xếp lớp.
 */
export type CreateEnrollmentRequestDto = {
  studentId: string;
  classId?: string | null;
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
 * Payload để chuyển lớp cho học viên.
 * Hỗ trợ toClassId (UUID) hoặc toClassCode (mã lớp) — ưu tiên toClassCode.
 */
export type TransferEnrollmentRequestDto = {
  toClassId?: string;
  toClassCode?: string;
  /** Ngày hiệu lực (YYYY-MM-DD). Mặc định: hôm nay */
  effectiveDate?: string;
  /** Lý do / ghi chú chuyển lớp */
  note?: string;
};
