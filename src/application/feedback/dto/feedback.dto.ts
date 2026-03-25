/**
 * src/application/feedback/dto/feedback.dto.ts
 * Nhóm các Data Transfer Objects (DTO) để trao đổi cục bộ với UI và hệ thống bên ngoài
 */

import type { AttendanceStatus, HomeworkStatus, FeedbackMetric } from '../../../domain/feedback/models/feedback.model';

// =========================================================
// Excel import/export contracts (FE shared DTO)
// Lưu ý: Đây là contract được FE dùng để khớp 1-1 với Backend.
// Mục tiêu là typed end-to-end, không "đoán" shape của response.
// =========================================================

/**
 * Danh sách codes lỗi khi import Excel feedback.
 * Khớp với `ImportErrorCode` ở Backend (`feedback-excel.contract.ts`).
 */
export const IMPORT_FEEDBACK_ERROR_CODES = [
  'MISSING_REQUIRED_COLUMN',
  'INVALID_HEADER',
  'EMPTY_FILE',
  'INVALID_SESSION_ID',
  'INVALID_STUDENT_ID',
  'SESSION_MISMATCH',
  'SESSION_TYPE_MISMATCH',
  'NOT_IN_ROSTER',
  'INVALID_ATTENDANCE',
  'INVALID_HOMEWORK',
  'INVALID_FEEDBACK_METRIC',
  'INVALID_SCORE_VALUE',
  'SCORE_NOT_ALLOWED_FOR_SESSION_TYPE',
  'DUPLICATE_STUDENT_IN_FILE',
  'ROW_PARSE_ERROR',
  'UNKNOWN_ERROR',
] as const;

export type ImportFeedbackErrorCodeDto = (typeof IMPORT_FEEDBACK_ERROR_CODES)[number];

/**
 * Canonical column keys trong Excel feedback (template/report/import).
 * Khớp với `FeedbackExcelColumnKey` ở Backend.
 */
export const FEEDBACK_EXCEL_COLUMN_KEYS = [
  'session_id',
  'session_date',
  'session_type',
  'class_code',
  'student_id',
  'student_name',
  'attendance',
  'homework',
  'participation',
  'behavior',
  'language_usage',
  'comment',
  'score_listening',
  'score_reading',
  'score_writing',
  'score_speaking',
  'score_total',
  'score_note',
] as const;

export type FeedbackExcelColumnKeyDto = (typeof FEEDBACK_EXCEL_COLUMN_KEYS)[number];

export const ATTENDANCE_EXCEL_VALUES = ['PRESENT', 'ABSENT', 'LATE'] as const;
export type AttendanceExcelValueDto = (typeof ATTENDANCE_EXCEL_VALUES)[number];

export const HOMEWORK_EXCEL_VALUES = ['DONE', 'NOT_DONE'] as const;
export type HomeworkExcelValueDto = (typeof HOMEWORK_EXCEL_VALUES)[number];

export const SESSION_TYPE_EXCEL_VALUES = ['NORMAL', 'QUIZ', 'MIDTERM', 'FINAL'] as const;
export type SessionTypeExcelValueDto = (typeof SESSION_TYPE_EXCEL_VALUES)[number];

/**
 * DTO lỗi từng dòng khi import Excel feedback.
 * Khớp với `ImportRowError` ở Backend.
 */
export interface ImportRowErrorDto {
  /** 1-based index của dòng trong Excel (tính cả header row). */
  rowIndex: number;
  /** Key của cột gây lỗi (nếu có). */
  columnKey?: FeedbackExcelColumnKeyDto;
  /**
   * Mã lỗi chuẩn để FE map sang i18n/message.
   * Theo contract mới: dùng tên field `errorCode`.
   */
  errorCode: ImportFeedbackErrorCodeDto;
  /**
   * Backward-compatible: giữ lại `code` để các phần UI cũ không vỡ.
   * TODO (Part sau): xoá dần `code` và chuẩn hoá toàn bộ sang `errorCode`.
   */
  code?: ImportFeedbackErrorCodeDto;
  /** Message server-side (thường tiếng Việt). */
  message: string;
  /** Giá trị cell gốc gây lỗi (nếu có). */
  value?: string | number;
}

/**
 * DTO kết quả import feedback Excel.
 * Khớp với `ImportFeedbackResult` ở Backend.
 */
export interface ImportFeedbackResultDto {
  success: boolean;
  partialSuccess: boolean;
  hasErrors: boolean;
  processedCount: number;
  successCount: number;
  errorCount: number;
  errors: ImportRowErrorDto[];
}

/**
 * Query params cho export feedback Excel (GET /classes/:classId/export).
 * Khớp với Backend: fromDate?, toDate?, sessionId?, includeScores?
 */
export interface ExportFeedbackExcelParamsDto {
  fromDate?: string;
  toDate?: string;
  sessionId?: string;
  includeScores?: boolean;
}

export type FeedbackExportJobStatusDto =
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface FeedbackExportJobDto {
  id: string;
  status: FeedbackExportJobStatusDto;
  progress: number;
  attempts: number;
  maxAttempts: number;
  error: string | null;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
}

/**
 * Phiên bản DTO chứa các cập nhật dữ liệu riêng biệt cho đánh giá học tập
 */
export interface UpsertFeedbackDto {
  attendance?: AttendanceStatus | null;
  homework?: HomeworkStatus | null;
  participation?: FeedbackMetric | null;
  behavior?: FeedbackMetric | null;
  languageUsage?: FeedbackMetric | null;
  comment?: string | null;
}

/**
 * DTO dành cho hành động thay đổi, nhập mới dữ liệu về điểm số
 */
export interface UpsertScoreDto {
  listening?: number | null;
  reading?: number | null;
  writing?: number | null;
  speaking?: number | null;
  total?: number | null;
  note: string | null;
}

/**
 * Tổng hợp thông tin từ mạng đối với một đối tượng học sinh về Điểm danh/Thái độ lẫn Điểm số
 */
export interface SessionFeedbackListItemDto {
  studentId: string;
  studentName: string;
  feedbackId?: string | null;
  attendance?: string | null;
  homework?: string | null;
  participation?: string | null;
  behavior?: string | null;
  languageUsage?: string | null;
  comment?: string | null;
  
  scoreId?: string | null;
  listening?: number | null;
  reading?: number | null;
  writing?: number | null;
  speaking?: number | null;
  total?: number | null;
  note?: string | null;
  
  updatedAt?: string | null;
}

/**
 * Cấu trúc trả về một chuỗi list các thông tin từ máy chủ về buổi học
 */
export interface SessionFeedbackListDto {
  items: SessionFeedbackListItemDto[];
  total: number;
}

// =========================================================
// API DTOs cho endpoint list session feedback (GET /sessions/:sessionId/feedback)
// Backend hiện trả về array, không bọc { items, total }.
// =========================================================

export interface SessionFeedbackApiFeedbackDto {
  id: string;
  attendance: string | null;
  homework: string | null;
  participation: string | null;
  behavior: string | null;
  languageUsage: string | null;
  comment: string | null;
  teacherId: string;
  updatedAt: string;
}

export interface SessionFeedbackApiItemDto {
  studentId: string;
  studentName: string;
  feedback: SessionFeedbackApiFeedbackDto | null;
}

export type SessionFeedbackListResponseDto = SessionFeedbackApiItemDto[];

// =========================================================
// API DTOs cho endpoint scores của học viên (GET /students/:id/scores)
// Backend hiện trả về array, không bọc { items, total }.
// =========================================================

export type ScoreTypeDto = 'TEST' | 'MIDTERM' | 'FINAL';

export interface StudentScoreApiItemDto {
  id: string;
  sessionId: string;
  studentId: string;
  scoreType: ScoreTypeDto;
  listening: number | null;
  reading: number | null;
  writing: number | null;
  speaking: number | null;
  total: number | null;
  createdAt: string;
  updatedAt: string;
}

export type StudentScoresListResponseDto = StudentScoreApiItemDto[];
