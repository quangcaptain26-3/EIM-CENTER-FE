/**
 * src/application/sessions/dto/sessions.dto.ts
 * Định nghĩa Data Transfer Object của module Session
 * Đây là cấu trúc dữ liệu thô nhận từ/gửi tới Backend API
 */

/**
 * Tham số tìm kiếm danh sách buổi học của lớp
 */
export interface ListSessionsParams {
  fromDate?: string;
  toDate?: string;
  // Các field có thể mở rộng sau này cho pagination hoặc search
}

/**
 * Tham số sinh danh sách buổi học
 */
export interface GenerateSessionsDto {
  /**
   * Deprecated: backend generate theo class.startDate.
   * Giữ lại để tương thích UI cũ (nếu còn truyền).
   */
  fromDate?: string;
  weeks?: number;
  untilUnitNo?: number;
  /** true: xóa toàn bộ buổi hiện có rồi sinh lại (mất feedback gắn buổi). */
  replaceExisting?: boolean;
}

/**
 * Payload dùng để cập nhật thông tin buổi học (đổi lịch, gán giáo viên thay, ghi chú...)
 */
export interface UpdateSessionDto {
  sessionDate?: string;
  note?: string;
  sessionStatus?: "SCHEDULED" | "CANCELLED" | "COMPLETED" | "MAKEUP";
  coverTeacherId?: string | null;
}

/**
 * Cấu trúc trả về cho chi tiết một buổi học từ API dựa trên SessionResponse từ Backend
 */
export interface SessionDetailDto {
  /** ID của buổi học */
  id: string;
  /** ID của lớp học tương ứng */
  classId: string;
  /** Thời gian của buổi học (ISO string formanted từ Date của backend) */
  sessionDate: string;
  /** Trạng thái buổi học */
  sessionStatus?: string;
  /** Số thứ tự Unit */
  unitNo: number;
  /** Số thứ tự Bài học. LessonNo = 0 quy định là của buổi kiểm tra */
  lessonNo: number;
  /** Mẫu gộp bài của curriculum (vd: "1&2"). Có thể null nếu là buổi kiểm tra. */
  lessonPattern: string | null;
  /** Phân loại buổi học trên Backend trọn vẹn (NORMAL, TEST, MIDTERM, FINAL) */
  sessionType: string;
  /** ID của giáo viên chính thức phụ trách lớp */
  mainTeacherId: string | null;
  /** ID của giáo viên dạy thay (nếu có) */
  coverTeacherId: string | null;
  /** Ngày khởi tạo dữ liệu buổi học */
  createdAt: string;
  /** Giá trị cờ true/false nếu đây là buổi học đặc biệt (kiểm tra lesson 0) */
  isSpecial: boolean;
}
