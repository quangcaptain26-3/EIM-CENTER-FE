/**
 * src/domain/sessions/models/session.model.ts
 * Đại diện cho Model buổi học (Session) phía Frontend
 */

/**
 * Loại buổi học được định nghĩa trong hệ thống khóa học.
 * Chuyển "TEST" của backend thành "QUIZ" theo yêu cầu từ frontend.
 */
export const SessionType = {
  NORMAL: "NORMAL",
  QUIZ: "QUIZ",
  MIDTERM: "MIDTERM",
  FINAL: "FINAL",
} as const;

export type SessionType = (typeof SessionType)[keyof typeof SessionType];

/**
 * Domain model đại diện cho một buổi học đã được xử lý và làm sạch cho UI frontend hiển thị
 */
export interface SessionModel {
  /** ID duy nhất của buổi học */
  id: string;
  /** ID lớp học mà buổi học này thuộc về */
  classId: string;
  /** Thời điểm diễn ra buổi học, định dạng chuỗi ISO */
  sessionDate: string;
  /** ID của Unit (Bài học) (Frontend tính thêm nếu cần) */
  unitId?: string;
  /** Số thứ tự phân phối chương trình của Unit */
  unitNo: number;
  /** Số thứ tự Lesson (nếu bằng 0 thì đại diện cho buổi kiểm tra/test) */
  lessonNo: number;
  /** Mẫu gộp bài của curriculum (vd: "1&2"). Null nếu không có. */
  lessonPattern?: string | null;
  /** Loại buổi học được ánh xạ cho frontend sử dụng */
  type: SessionType;
  /** ID giáo viên thực tế đứng lớp (sẽ là Giáo viên main nếu không có giáo viên dạy thay) */
  teacherEffectiveId?: string | null;
  /** Tên đầy đủ của giáo viên thực tế đứng lớp */
  teacherEffectiveName?: string | null;
}
