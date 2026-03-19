/**
 * src/domain/feedback/models/score.model.ts
 * Đại diện cho mô hình cấu trúc dữ liệu điểm số (Score) của hệ thống phía frontend
 */

/**
 * Model thể hiện mức điểm và đánh giá ghi chú của học viên cho các buổi học có yêu cầu bài test/quiz
 */
export interface ScoreModel {
  /** ID duy nhất của bản ghi điểm */
  id: string;
  /** Buổi học đánh giá/test */
  sessionId: string;
  /** ID học viên thực hiện test */
  studentId: string;
  /** Họ tên rút gọn hoặc đầy đủ của học viên */
  studentName: string;
  /** Điểm nghe - Listening (0-100) */
  listening: number | null;
  /** Điểm đọc - Reading (0-100) */
  reading: number | null;
  /** Điểm viết - Writing (0-100) */
  writing: number | null;
  /** Điểm nói - Speaking (0-100) */
  speaking: number | null;
  /** Điểm tổng kết - Total (Trung bình hoặc tổng) */
  total: number | null;
  /** Nhận xét hoặc ghi chú đi kèm với điểm */
  note: string | null;
}
