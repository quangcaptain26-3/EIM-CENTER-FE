export interface ClassSessionRow {
  id: string;
  sequenceNo: number;
  scheduledDate: string;
  status: string;
  mainTeacherName?: string;
  mainTeacherId?: string;
  coverTeacherName?: string | null;
  coverTeacherId?: string | null;
  coverStatus?: string | null;
  /** GV hiện tại đang dạy (cover hoặc chính) */
  displayTeacherLabel?: string;
}

export interface MySessionRow {
  id: string;
  scheduledDate: string;
  classId: string;
  classCode?: string;
  className?: string;
  shiftLabel?: string;
  roleType: 'main' | 'cover';
  status: string;
  /** Buổi chính đang có GV cover (status cover ≠ cancelled) — tên GV cover */
  coverTeacherName?: string | null;
}

export interface AvailableCoverTeacher {
  userId: string;
  fullName: string;
  /** BE: true = có thể chọn */
  isAvailable?: boolean;
  /** true = không chọn được (derive từ !isAvailable nếu BE không gửi) */
  isConflict?: boolean;
  conflictReason?: string | null;
}

export interface SessionDetailPayload {
  id: string;
  classId: string;
  classCode?: string;
  scheduledDate: string;
  shiftLabel?: string;
  roomName?: string;
  mainTeacherName?: string;
  /** GV chính — quyền điểm danh */
  mainTeacherId?: string;
  /** GV cover hiệu lực — quyền điểm danh */
  coverTeacherId?: string | null;
  coverTeacherName?: string | null;
  coverStatus?: string | null;
  coverReason?: string | null;
  status: string;
  attendanceRows: SessionAttendanceRow[];
}

export interface SessionAttendanceRow {
  enrollmentId: string;
  studentId?: string;
  studentCode?: string | null;
  studentName: string;
  status?: string | null;
  note?: string | null;
  /** Từ roster — cảnh báo vắng KP */
  unexcusedAbsenceCount?: number;
}
