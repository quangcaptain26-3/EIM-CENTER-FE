/**
 * src/domain/feedback/rules/feedback.rule.ts
 * Chứa đựng các quy tắc nghiệp vụ quan trọng xoay quanh Đánh giá và Chấm điểm (Feedback & Score)
 */

import { SessionType } from '../../sessions/models/session.model';
import type { ScoreTypeDto } from '@/application/feedback/dto/feedback.dto';

/**
 * Xác định quyền được nhập đánh giá cho buổi học dựa vào vai trò và sự liên kết giáo viên.
 * Chỉ cho phép giáo viên được chỉ định đứng lớp để thực hiện thao tác nộp bản đánh giá.
 * 
 * @param userRole - Vai trò lớn nhất trong hệ thống của người dùng (VD: TEACHER, DIRECTOR)
 * @param teacherEffectiveId - ID của giáo viên được ghi nhận làm người dạy chính
 * @param currentUserId - ID của người dùng đang tương tác
 * @returns true nếu người dùng đủ điều kiện và quyền han để can thiệp
 */
export function canSubmitFeedback(userRole: string, teacherEffectiveId: string | null | undefined, currentUserId: string): boolean {
  if (userRole === 'TEACHER') {
    return teacherEffectiveId === currentUserId;
  }
  // Các quyền giám sát và quản lý chất lượng (Có thể điều chỉnh thêm tuỳ chính sách)
  const powerRoles = ['ROOT', 'DIRECTOR', 'ACADEMIC'];
  return powerRoles.includes(userRole);
}

/**
 * Kiểm định một chỉ số FeedbackMetric (Thang 1 tới 5) có nằm đúng khoảng thông số hay không.
 * 
 * @param value - Giá trị số muốn kiểm định
 * @returns true nếu phù hợp, false nếu nằm ngoài khung cho phép hoặc số thực
 */
export function isValidMetric(value: number): boolean {
  if (!Number.isInteger(value)) return false;
  return value >= 1 && value <= 5;
}

/**
 * Quy tắc lựa chọn những buổi học nào bắt buộc hoặc có thể dùng chức năng "nhập điểm số".
 * Phần hệ thống ghi điểm chỉ cần cho Test, Midterm, và Final.
 * 
 * @param sessionType - Thuộc tính phân loại buổi học (NORMAL, QUIZ...)
 * @returns true nếu là tiết kiểm tra cần dùng form điểm
 */
export function requiresScore(sessionType: SessionType): boolean {
  return sessionType === SessionType.QUIZ || 
         sessionType === SessionType.MIDTERM || 
         sessionType === SessionType.FINAL;
}

/**
 * Chuẩn hoá mapping SessionType (FE) -> ScoreType (BE contract).
 * - FE dùng "QUIZ" trong khi BE lưu scoreType là "TEST".
 */
export function scoreTypeForSessionType(sessionType: SessionType): ScoreTypeDto {
  if (sessionType === SessionType.MIDTERM) return 'MIDTERM';
  if (sessionType === SessionType.FINAL) return 'FINAL';
  // QUIZ
  return 'TEST';
}
