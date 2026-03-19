/**
 * src/infrastructure/services/feedback.api.ts
 * Nhận trách nhiệm liên lạc tới Backend cho các yêu cầu Đánh giá và Điểm số (Feedbacks & Scores)
 */

import { apiClient } from '@/app/config/axios';
import type { ApiSuccessResponse } from '@/shared/types/api.type';
import type {
  ExportFeedbackExcelParamsDto,
  FeedbackExportJobDto,
  ImportFeedbackResultDto,
  ImportRowErrorDto,
  ScoreTypeDto,
  StudentScoresListResponseDto,
  SessionFeedbackListResponseDto,
  UpsertFeedbackDto,
  UpsertScoreDto,
} from '../../application/feedback/dto/feedback.dto';
import { downloadExcelFromApi } from '@/shared/lib/excel';

export interface ExportFeedbackReportParamsDto extends ExportFeedbackExcelParamsDto {
  classId: string;
}

/**
 * Lấy danh sách điểm danh, đánh giá, phản hồi hiện hữu trong 1 lớp/buổi do phụ trách.
 * 
 * @param sessionId - Mã độc nhất chỉ định một buổi cụ thể
 * @returns Lời hứa (Promise) cùng danh sách học viên chứa phản hồi tương ứng
 */
export async function listSessionFeedback(sessionId: string): Promise<SessionFeedbackListResponseDto> {
  const response = await apiClient.get<ApiSuccessResponse<SessionFeedbackListResponseDto>>(
    `/sessions/${sessionId}/feedback`,
  );
  return response.data.data;
}

/**
 * Thực hiện tạo hoặc cập nhật riêng rẽ cho đánh giá chi tiết của 1 học viên trong tiết.
 * Phương thức nhận đối tượng UpsertFeedbackDto để map ngược thân mạng.
 * 
 * @param sessionId - Buổi học đang cập nhật 
 * @param studentId - Học viên chịu tác động
 * @param dto - Trường thông tin DTO phản hồi chứa điểm danh, bài tập, metrics...
 */
export async function upsertFeedback(sessionId: string, studentId: string, dto: UpsertFeedbackDto): Promise<void> {
  // Đồng bộ với việc API nhận "items" là một mảng cho khối lượng công việc hàng loạt.
  const payload = {
    items: [
      {
        studentId,
        attendance: dto.attendance,
        homework: dto.homework,
        participation: dto.participation,
        behavior: dto.behavior,
        // Fix bug: không được làm rơi field languageUsage khi upsert
        languageUsage: dto.languageUsage,
        comment: dto.comment, // Đã đồng bộ với BE sử dụng field 'comment' thay vì 'commentText'
      }
    ]
  };

  await apiClient.post<ApiSuccessResponse<unknown>>(
    `/sessions/${sessionId}/feedback/upsert`,
    payload,
  );
}

/**
 * Khởi tạo dữ liệu điểm trong bài test học kỳ dành cho 1 học viên cụ thể
 * 
 * @param sessionId - Phiên học (của buổi kiểm định chuyên đề)
 * @param studentId - Người nhận đánh giá
 * @param dto - Cấu trúc điểm chỉ dẫn và note
 */
export async function upsertScore(
  sessionId: string,
  studentId: string,
  scoreType: ScoreTypeDto,
  dto: UpsertScoreDto,
): Promise<void> {
  const payload = {
    items: [
        {
          studentId,
          scoreType,
          listening: dto.listening,
          reading: dto.reading,
          writing: dto.writing,
          speaking: dto.speaking,
          total: dto.total,
          note: dto.note,
        }
    ]
  };

  await apiClient.post<ApiSuccessResponse<unknown>>(
    `/sessions/${sessionId}/scores/upsert`,
    payload,
  );
}

/**
 * Thu thập lại chuỗi lịch sử điểm số do học viên ấy lập được ở nhiều ngữ cảnh khác
 * 
 * @param studentId - ID cần tra cứu định danh
 * @returns Khối cấu trúc không định trước (Phụ thuộc BE format), liệt kê tiến trình cá nhân
 */
export async function listStudentScores(studentId: string): Promise<StudentScoresListResponseDto> {
  const response = await apiClient.get<ApiSuccessResponse<StudentScoresListResponseDto>>(`/students/${studentId}/scores`);
  return response.data.data;
}

/**
 * Tải file Excel template cho 1 buổi học.
 * Endpoint BE: GET /sessions/:sessionId/feedback/template
 */
export async function downloadFeedbackTemplate(sessionId: string): Promise<void> {
  const dateStr = new Date().toISOString().slice(0, 10);
  const fallbackFilename = `feedback-template-${sessionId}-${dateStr}.xlsx`;
  await downloadExcelFromApi(`/sessions/${sessionId}/feedback/template`, {}, fallbackFilename);
}

/**
 * Xuất báo cáo feedback của một lớp ra file Excel.
 * Endpoint BE: GET /classes/:classId/export
 *
 * Rules:
 * - BE có thể set filename trong Content-Disposition → util sẽ tự ưu tiên tên BE.
 * - Nếu BE không set → fallback tên sạch theo convention.
 */
export async function exportFeedbackReport(params: ExportFeedbackReportParamsDto): Promise<void> {
  const dateStr = new Date().toISOString().slice(0, 10);
  const { classId, ...query } = params;
  const fallbackFilename = `feedback-${classId}-${dateStr}.xlsx`;
  await downloadExcelFromApi(
    `/classes/${classId}/export`,
    query as Record<string, unknown>,
    fallbackFilename,
  );
}

export async function createFeedbackExportJob(params: ExportFeedbackReportParamsDto): Promise<{ jobId: string; status: string; progress: number }> {
  const { classId, ...payload } = params;
  const response = await apiClient.post<ApiSuccessResponse<{ jobId: string; status: string; progress: number }>>(
    `/classes/${classId}/export/jobs`,
    payload,
  );
  return response.data.data;
}

export async function getFeedbackExportJob(classId: string, jobId: string): Promise<FeedbackExportJobDto> {
  const response = await apiClient.get<ApiSuccessResponse<FeedbackExportJobDto>>(
    `/classes/${classId}/export/jobs/${jobId}`,
  );
  return response.data.data;
}

export async function cancelFeedbackExportJob(classId: string, jobId: string): Promise<void> {
  await apiClient.post<ApiSuccessResponse<unknown>>(`/classes/${classId}/export/jobs/${jobId}/cancel`);
}

export async function retryFeedbackExportJob(classId: string, jobId: string): Promise<void> {
  await apiClient.post<ApiSuccessResponse<unknown>>(`/classes/${classId}/export/jobs/${jobId}/retry`);
}

export async function downloadFeedbackExportJob(classId: string, jobId: string): Promise<void> {
  const fallbackFilename = `feedback-export-${classId}.xlsx`;
  await downloadExcelFromApi(`/classes/${classId}/export/jobs/${jobId}/download`, {}, fallbackFilename);
}

/**
 * Upload file Excel để import feedback hàng loạt cho một buổi học cụ thể.
 * @param sessionId - Buổi học cần import
 * @param file - File object (Excel)
 */
export async function importFeedbackExcel(sessionId: string, file: File): Promise<ImportFeedbackResultDto> {
  const formData = new FormData();
  formData.append('file', file);

  // Backend trả `{ success: true, data: ImportFeedbackResult }`.
  // Frontend chuẩn hoá lại lỗi theo contract mới: `errorCode` + `value: string | number`.
  const result = await apiClient.post<ApiSuccessResponse<{
    success: boolean;
    partialSuccess?: boolean;
    hasErrors?: boolean;
    processedCount: number;
    successCount: number;
    errorCount: number;
    errors: Array<{
      rowIndex: number;
      columnKey?: string;
      code: string;
      message: string;
      value?: string | number;
    }>;
  }>>(
    `/sessions/${sessionId}/feedback/import`,
    formData,
    {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
    }
  );

  const be = result.data.data;

  const mappedErrors: ImportRowErrorDto[] = be.errors.map((e) => ({
    rowIndex: e.rowIndex,
    columnKey: e.columnKey as ImportRowErrorDto['columnKey'],
    // Chuẩn hoá field name theo contract FE: errorCode
    errorCode: e.code as ImportRowErrorDto['errorCode'],
    // Backward-compatible
    code: e.code as ImportRowErrorDto['errorCode'],
    message: e.message,
    value: e.value,
  }));

  return {
    success: be.success,
    partialSuccess: Boolean(be.partialSuccess),
    hasErrors: typeof be.hasErrors === 'boolean' ? be.hasErrors : be.errorCount > 0,
    processedCount: be.processedCount,
    successCount: be.successCount,
    errorCount: be.errorCount,
    errors: mappedErrors,
  };
}

// ----------------------------------------------------------------
// Backward-compatible aliases (để không vỡ code cũ nếu đang dùng tên cũ)
// ----------------------------------------------------------------

/** @deprecated Dùng `downloadFeedbackTemplate(sessionId)` */
export const downloadSessionFeedbackTemplateExcel = downloadFeedbackTemplate;

/** @deprecated Dùng `exportFeedbackReport({ classId, ...params })` */
export const exportFeedbackExcel = (classId: string, params: ExportFeedbackExcelParamsDto): Promise<void> =>
  exportFeedbackReport({ classId, ...params });
