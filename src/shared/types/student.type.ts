import { ENROLLMENT_STATUS } from '@/shared/constants/statuses';

export type EnrollmentStatus = (typeof ENROLLMENT_STATUS)[keyof typeof ENROLLMENT_STATUS];

export interface StudentListItem {
  id: string;
  studentCode: string;
  fullName: string;
  parentName?: string | null;
  parentPhone?: string | null;
  parentPhone2?: string | null;
  parentZalo?: string | null;
  /** Mã lớp từ ghi danh đang hoạt động */
  activeClassCode?: string | null;
  currentClassName?: string | null;
  currentClassId?: string | null;
  /** Tên chương trình / cấp độ hiển thị badge */
  programName?: string | null;
  levelLabel?: string | null;
  /** Mã cấp từ bảng students (programs.code) — fallback khi chưa có programName từ ghi danh */
  currentLevel?: string | null;
  enrollmentStatus?: string | null;
  status?: string | null;
}

export interface StudentDetail extends StudentListItem {
  currentLevel?: string | null;
  currentProgramName?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  address?: string | null;
  schoolName?: string | null;
  testResult?: string | null;
  parentEmail?: string | null;
  note?: string | null;
  /** ISO — từ BE khi có */
  createdAt?: string | null;
  /** UUID người tạo — khi không có tên hiển thị */
  createdBy?: string | null;
  createdByName?: string | null;
}

export interface StudentSearchSuggestion {
  id: string;
  studentCode: string;
  fullName: string;
  parentPhone?: string | null;
  label?: string;
  /** Trạng thái ghi danh / học viên để badge */
  status?: string | null;
  enrollmentStatus?: string | null;
  /** Mã CT / cấp đang học (từ activeEnrollment) */
  currentLevelLabel?: string | null;
  activeClassCode?: string | null;
}

export interface EnrollmentCardModel {
  id: string;
  programId?: string;
  /** Mã chương trình (VD: EIM_KIDS) */
  programCode?: string;
  programName?: string;
  classId?: string;
  className?: string;
  classCode?: string;
  status: string;
  sessionsCompleted?: number;
  sessionsTotal?: number;
  sessionsAttended?: number;
  transferCount?: number;
  classTransferCount?: number;
  transferBlocked?: boolean;
  makeupBlocked?: boolean;
  /** Số buổi vắng không phép (cảnh báo ≥3) */
  unexcusedAbsences?: number;
  /** Đang có yêu cầu bảo lưu chờ duyệt */
  pendingPauseRequest?: boolean;
  /** Thống kê điểm danh tích lũy */
  attendancePresent?: number;
  attendanceLate?: number;
  attendanceExcused?: number;
  attendanceUnexcused?: number;
  /** Snapshot học phí lúc ghi danh (= enrollment.tuitionFee BE) */
  tuitionFee?: number | null;
  /** Alias hiển thị — cùng giá trị tuitionFee */
  tuitionAmount?: number | null;
  amountPaid?: number | null;
  debtAmount?: number | null;
  endedAt?: string | null;
}

export interface AttendanceHistoryRow {
  id: string;
  sessionNo?: number | null;
  sessionDate?: string;
  status?: string;
  note?: string | null;
  className?: string;
  /** 1 | 2 — từ JOIN sessions */
  shift?: number | null;
  shiftLabel?: string | null;
  /** Giờ cụ thể VD 18:00–19:30 */
  timeRange?: string | null;
}

export interface MakeupSessionRow {
  id: string;
  code?: string;
  studentId?: string;
  studentName?: string;
  studentCode?: string;
  enrollmentId?: string;
  /** Buổi gốc bị vắng */
  originalSessionNo?: number | null;
  originalDate?: string | null;
  scheduledDate?: string;
  status: string;
  roomId?: string;
  roomName?: string;
  teacherId?: string;
  teacherName?: string;
}

export interface PauseRequestRow {
  id: string;
  code?: string;
  studentId?: string;
  studentName?: string;
  studentCode?: string;
  classCode?: string | null;
  className?: string | null;
  enrollmentId?: string;
  sessionsAttended?: number | null;
  reason?: string;
  status: string;
  requestedAt?: string;
}
