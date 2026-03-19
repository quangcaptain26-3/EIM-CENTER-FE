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
 * Mô hình dữ liệu ghi danh của học viên vào lớp
 */
export type EnrollmentModel = {
  id: string; // ID duy nhất của enrollment
  studentId: string; // ID học viên
  classId: string; // ID lớp học
  status: EnrollmentStatus; // Trạng thái ghi danh hiện tại
  startDate: string; // Ngày bắt đầu học (ISO string)
  endDate?: string; // Ngày kết thúc học hoặc ngày dự kiến (ISO string)
  createdAt: string; // Ngày tạo bản ghi (ISO string)
};
