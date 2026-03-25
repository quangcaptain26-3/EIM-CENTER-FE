/**
 * Trạng thái của một ghi danh (enrollment)
 */
export type EnrollmentStatus = 'ACTIVE' | 'PAUSED' | 'DROPPED' | 'TRANSFERRED' | 'GRADUATED';

/**
 * Danh sách các giá trị trạng thái ghi danh hợp lệ
 */
export const ENROLLMENT_STATUS_VALUES: EnrollmentStatus[] = [
  'ACTIVE',
  'PAUSED',
  'DROPPED',
  'TRANSFERRED',
  'GRADUATED',
];

/**
 * Tóm tắt chuyên cần theo enrollment (metadata nghiệp vụ)
 */
export type AttendanceSummaryModel = {
  absentCount: number;
  totalSessions: number;
  warningThreshold: number;
  isAtRisk: boolean;
};

/**
 * Mô hình dữ liệu ghi danh của học viên vào lớp
 */
export type EnrollmentModel = {
  id: string;
  studentId: string;
  classId: string | null;
  classCode?: string | null;
  /** ID chương trình (từ class) — dùng filter chuyển lớp cùng program */
  programId?: string | null;
  status: EnrollmentStatus;
  startDate: string; // Ngày bắt đầu học (ISO string)
  endDate?: string; // Ngày kết thúc học hoặc ngày dự kiến (ISO string)
  createdAt: string; // Ngày tạo bản ghi (ISO string)
  attendanceSummary?: AttendanceSummaryModel; // Chuyên cần — có khi gọi với includeAttendanceSummary
};
