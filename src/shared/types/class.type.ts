import type { ProgramCode } from '@/shared/types/api-contract';

/** Lớp — danh sách */
export interface ClassListItem {
  id: string;
  classCode: string;
  programId?: string;
  programName?: string;
  roomId?: string;
  roomName?: string;
  roomCode?: string;
  shiftLabel?: string;
  /** SHIFT_1 | SHIFT_2 — để lọc Ca */
  shift?: string;
  scheduleDays?: number[];
  scheduleLabel?: string;
  mainTeacherId?: string;
  mainTeacherName?: string;
  enrollmentCount?: number;
  /** Nếu BE trả về — dùng để lọc lớp “còn chỗ” khi chuyển lớp */
  maxEnrollment?: number;
  /** Sức chứa tối đa (thường 12) — ClassResponse.maxCapacity */
  maxCapacity?: number;
  status: string;
  announcedAt?: string | null;
  /** Tiến độ buổi (nếu BE có) */
  completedSessions?: number;
  totalSessions?: number;
}

export interface ClassTeacherHistoryEntry {
  id: string;
  teacherName: string;
  teacherId?: string;
  effectiveFrom?: string;
  effectiveTo?: string | null;
  reason?: string | null;
}

export interface ClassStaffHistoryEntry {
  id: string;
  staffName: string;
  staffId?: string;
  role?: string;
  startedAt?: string;
  endedAt?: string | null;
}

/** Chi tiết lớp (tab Thông tin) */
export interface ClassDetail extends ClassListItem {
  startDate?: string | null;
  notes?: string | null;
  teacherHistory?: ClassTeacherHistoryEntry[];
  staffHistory?: ClassStaffHistoryEntry[];
}

export interface RosterRow {
  enrollmentId: string;
  studentId: string;
  studentName: string;
  studentCode?: string;
  status: string;
  type?: 'regular' | 'trial' | string;
  /** Buổi đã học / tổng (vd. 8/24) */
  sessionsCompleted?: number;
  sessionsTotal?: number;
  /** Số tiền nợ (VND) */
  debtAmount?: number | null;
  /** Đếm vắng không phép lũy kế — cảnh báo khi chọn U */
  unexcusedAbsenceCount?: number;
}

/** `code` có khi lấy từ API /programs */
export interface ProgramOption {
  id: string;
  name: string;
  code?: ProgramCode;
  /** Học phí gói mặc định (programs.default_fee) */
  defaultFee?: number;
  totalSessions?: number;
  levelOrder?: number;
  isActive?: boolean;
  feePerSession?: number;
  feeLabel?: string;
}

export interface RoomOption {
  id: string;
  name: string;
  code?: string;
  roomCode?: string;
  capacity?: number;
}
