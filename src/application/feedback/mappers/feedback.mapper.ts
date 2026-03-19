/**
 * src/application/feedback/mappers/feedback.mapper.ts
 * Biến đổi các giá trị API trở về DTO giao diện và ngược lại (Ánh xạ mapping đối tượng)
 */

import type { FeedbackRowModel, FeedbackMetric } from '../../../domain/feedback/models/feedback.model';
import { AttendanceStatus, HomeworkStatus } from '../../../domain/feedback/models/feedback.model';
import type { ScoreModel } from '../../../domain/feedback/models/score.model';
import type { SessionFeedbackListItemDto } from '../dto/feedback.dto';

export class FeedbackMapper {
  /**
   * Phương thức tiện ích để ép kiểu sang FeedbackMetric (Thang từ 1 đến 5),
   * Phục vụ khâu bắt lỗi từ network payload không rõ ràng
   * 
   * @param val - Dữ liệu chuỗi hoặc số ban đầu
   * @returns Chỉ số 1-5 hoặc null nếu vô giá trị
   */
  private static parseMetric(val: string | number | null | undefined): FeedbackMetric | null {
    if (val === null || val === undefined) return null;
    const num = Number(val);
    if (!Number.isNaN(num) && num >= 1 && num <= 5) {
      return num as FeedbackMetric;
    }
    return null;
  }

  /**
   * Biến đổi dữ liệu gói SessionFeedbackListItemDto tới khuôn mẫu Model quản trị
   * danh sách FeedbackRow trong các màn hình dạng Table (Bảng)
   * 
   * @param sessionId - Chuỗi ID định vị nhóm buổi học
   * @param dto - Cấu trúc dữ liệu API học viên trả về 
   * @returns Domain Model để UI thao tác và rendering an toàn
   */
  static toFeedbackRowModel(sessionId: string, dto: SessionFeedbackListItemDto): FeedbackRowModel {
    return {
      feedbackId: dto.feedbackId ?? null,
      sessionId: sessionId,
      studentId: dto.studentId,
      studentName: dto.studentName,
      attendance: (dto.attendance as AttendanceStatus) || null,
      homework: (dto.homework as HomeworkStatus) || null,
      participation: this.parseMetric(dto.participation),
      behavior: this.parseMetric(dto.behavior),
      languageUsage: this.parseMetric(dto.languageUsage),
      comment: dto.comment ?? null,
    };
  }

  /**
   * Biến đổi dữ liệu điểm trả về từ mạng thành mô hình Domain điểm số của học viên
   * 
   * @param sessionId - Chuỗi ID gắn buổi học hiện tại
   * @param dto - Dữ liệu raw chứa những chỉ số điểm
   * @returns Interface định chuẩn của frontend ScoreModel
   */
  static toScoreModel(sessionId: string, dto: SessionFeedbackListItemDto): ScoreModel {
    return {
      id: dto.scoreId ?? '',
      sessionId: sessionId,
      studentId: dto.studentId,
      studentName: dto.studentName,
      listening: dto.listening ?? null,
      reading: dto.reading ?? null,
      writing: dto.writing ?? null,
      speaking: dto.speaking ?? null,
      total: dto.total ?? null,
      note: dto.note ?? null,
    };
  }
}
