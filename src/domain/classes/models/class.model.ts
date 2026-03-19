/**
 * Domain Models cho module Lớp học (Classes)
 * Định nghĩa cấu trúc dữ liệu cốt lõi dùng trong tầng Domain,
 * bám sát với Entities ở backend nhưng chuẩn hóa kiểu dữ liệu cho frontend (chuỗi ISO, enum,...)
 */

/**
 * Trạng thái của lớp học
 * Khớp với `ClassStatus` ở backend: "ACTIVE" | "PAUSED" | "CLOSED"
 */
export const ClassStatus = {
  ACTIVE: "ACTIVE",
  PAUSED: "PAUSED",
  CLOSED: "CLOSED",
} as const;

export type ClassStatus = (typeof ClassStatus)[keyof typeof ClassStatus];

/**
 * Model đại diện cho Lớp học trong domain
 * Mapping từ backend entity `Class` với các trường dùng trong UI
 */
export interface ClassModel {
  /** ID lớp học (UUID) */
  id: string;
  /** Mã lớp học (code) */
  code: string;
  /** Tên lớp học */
  name: string;
  /** ID chương trình học (programId) */
  programId: string;
  /** Tên chương trình (để hiển thị trên UI) */
  programName?: string | null;
  /** Phòng học (có thể rỗng) */
  room: string | null;
  /** Sĩ số tối đa của lớp */
  capacity: number;
  /** Sĩ số hiện tại (đã xếp lớp, ACTIVE) */
  currentSize?: number;
  /** Ngày bắt đầu (định dạng ISO yyyy-MM-dd hoặc yyyy-MM-ddTHH:mm:ss) */
  startDate: string;
  /** Trạng thái lớp học */
  status: ClassStatus;
  /** Thời điểm tạo (ISO string) */
  createdAt: string;
  /** Danh sách lịch học của lớp (nếu đã load chi tiết) */
  schedules?: ClassScheduleModel[];
  /** Danh sách nhân sự được phân công cho lớp (nếu đã load chi tiết) */
  staff?: ClassStaffModel[];
}

/**
 * Model lịch học của lớp (ClassSchedule)
 * Khớp với entity `ClassSchedule` ở backend
 */
export interface ClassScheduleModel {
  /** ID lịch học (UUID) */
  id: string;
  /** ID lớp học */
  classId: string;
  /** Thứ trong tuần: 1 (Thứ 2) - 7 (Chủ nhật) */
  weekday: number;
  /** Giờ bắt đầu, ví dụ: "18:00:00" */
  startTime: string;
  /** Giờ kết thúc, ví dụ: "19:30:00" */
  endTime: string;
}

/**
 * Loại nhân sự được phân công cho lớp
 * Khớp với `StaffType` ở backend: "MAIN" | "TA"
 */
export type StaffType = "MAIN" | "TA";

/**
 * Model nhân sự được phân công cho lớp (ClassStaff)
 * Khớp với entity `ClassStaff` ở backend
 */
export interface ClassStaffModel {
  /** ID bản ghi phân công (UUID) */
  id: string;
  /** ID lớp học */
  classId: string;
  /** ID user (giáo viên) */
  userId: string;
  /** Loại nhân sự: MAIN (GV chính) hoặc TA (Trợ giảng) */
  type: StaffType;
  /** Thời điểm được phân công (ISO string) */
  assignedAt: string;
}

