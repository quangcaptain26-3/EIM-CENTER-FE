/**
 * src/domain/feedback/models/feedback.model.ts
 * Đại diện cho cấu trúc dữ liệu của các đánh giá (Feedback) học tập từ giáo viên
 */

/**
 * Trạng thái điểm danh của học viên
 */
export const AttendanceStatus = {
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
  LATE: 'LATE',
} as const;
export type AttendanceStatus = (typeof AttendanceStatus)[keyof typeof AttendanceStatus];

/**
 * Trạng thái hoàn thành bài tập về nhà của học viên
 */
export const HomeworkStatus = {
  DONE: 'DONE',
  NOT_DONE: 'NOT_DONE',
} as const;
export type HomeworkStatus = (typeof HomeworkStatus)[keyof typeof HomeworkStatus];

/**
 * Thước đo đánh giá học tập dưới dạng điểm từ 1 đến 5
 */
export type FeedbackMetric = 1 | 2 | 3 | 4 | 5;

/**
 * Model biểu diễn thông tin đánh giá toàn diện sau khi đã tồn tại trong hệ thống
 */
export interface FeedbackModel {
  id: string;
  sessionId: string;
  studentId: string;
  studentName: string;
  attendance: AttendanceStatus;
  homework: HomeworkStatus;
  participation: FeedbackMetric;
  behavior: FeedbackMetric;
  languageUsage: FeedbackMetric;
  comment: string | null;
  createdBy: string;
  updatedAt: string;
}

/**
 * Model đánh giá theo từng dòng học viên trong lớp (hỗ trợ cho bảng nhập nhanh - nullable khi chưa có dữ liệu)
 */
export interface FeedbackRowModel {
  feedbackId?: string | null;
  sessionId: string;
  studentId: string;
  studentName: string;
  attendance: AttendanceStatus | null;
  homework: HomeworkStatus | null;
  participation: FeedbackMetric | null;
  behavior: FeedbackMetric | null;
  languageUsage: FeedbackMetric | null;
  comment: string | null;
}
