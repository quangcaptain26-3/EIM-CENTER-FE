/**
 * src/presentation/hooks/feedback/use-feedback-mutations.ts
 * Nhóm các hooks thực hiện hành động (Mutations) về Đánh giá và Điểm số.
 */
import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/infrastructure/query/query-keys';
import {
  cancelFeedbackExportJob,
  createFeedbackExportJob,
  downloadFeedbackExportJob,
  getFeedbackExportJob,
  downloadFeedbackTemplate,
  exportFeedbackReport,
  retryFeedbackExportJob,
  upsertFeedback,
  upsertScore,
  exportFeedbackExcel,
  importFeedbackExcel,
} from '@/infrastructure/services/feedback.api';
import { toastAdapter } from '@/infrastructure/adapters/toast.adapter';
import { mapHttpError } from '@/infrastructure/http/http-error.mapper';
import type {
  ExportFeedbackExcelParamsDto,
  ImportFeedbackResultDto,
  ScoreTypeDto,
  UpsertFeedbackDto,
  UpsertScoreDto,
} from '@/application/feedback/dto/feedback.dto';

/**
 * Hook action tải template feedback theo session.
 *
 * Quy ước:
 * - Hook chỉ làm IO + expose pending/error.
 * - Không parse Excel ở FE (BE trả blob .xlsx).
 * - Không toast trong hook để tránh spam; UI layer tự quyết định.
 */
export const useDownloadFeedbackTemplate = (sessionId: string) => {
  return useMutation<void, unknown, void>({
    mutationFn: async () => {
      // BE trả file .xlsx (blob). Util download đã xử lý Content-Disposition + fallback filename.
      await downloadFeedbackTemplate(sessionId);
    },
  });
};

/**
 * Hook action xuất báo cáo feedback (report) của lớp.
 *
 * Fix chính:
 * - Chuẩn hoá params theo contract mới (fromDate/toDate/sessionId/includeScores).
 * - Gọi đúng service `exportFeedbackReport` để BE nhận filter (đặc biệt sessionId).
 *
 * Quy ước:
 * - Hook chỉ làm IO + expose pending/error.
 * - Không toast trong hook để tránh spam; UI layer tự quyết định.
 */
export const useExportFeedbackReport = (classId: string) => {
  return useMutation<void, unknown, ExportFeedbackExcelParamsDto>({
    mutationFn: async (params) => {
      await exportFeedbackReport({ classId, ...params });
    },
  });
};

export const useFeedbackExportJobActions = (classId: string) => {
  const createJobMutation = useMutation({
    mutationFn: async (params: ExportFeedbackExcelParamsDto) => createFeedbackExportJob({ classId, ...params }),
  });

  const getJobMutation = useMutation({
    mutationFn: async (jobId: string) => getFeedbackExportJob(classId, jobId),
  });

  const cancelJobMutation = useMutation({
    mutationFn: async (jobId: string) => cancelFeedbackExportJob(classId, jobId),
  });

  const retryJobMutation = useMutation({
    mutationFn: async (jobId: string) => retryFeedbackExportJob(classId, jobId),
  });

  const downloadJobMutation = useMutation({
    mutationFn: async (jobId: string) => downloadFeedbackExportJob(classId, jobId),
  });

  return {
    createJob: createJobMutation.mutateAsync,
    isCreatingJob: createJobMutation.isPending,
    createJobError: createJobMutation.error,

    getJob: getJobMutation.mutateAsync,
    isGettingJob: getJobMutation.isPending,
    getJobError: getJobMutation.error as unknown,

    cancelJob: cancelJobMutation.mutateAsync,
    isCancellingJob: cancelJobMutation.isPending,

    retryJob: retryJobMutation.mutateAsync,
    isRetryingJob: retryJobMutation.isPending,

    downloadJob: downloadJobMutation.mutateAsync,
    isDownloadingJob: downloadJobMutation.isPending,
  };
};

/**
 * Hook Mutation cho tác vụ ghi nhận hoặc cập nhật Bản đánh giá của Giáo viên dành cho một học viên trong tiết học định sẵn.
 */
export const useUpsertFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      studentId,
      payload,
    }: {
      sessionId: string;
      studentId: string;
      payload: UpsertFeedbackDto;
    }) => upsertFeedback(sessionId, studentId, payload),
    onSuccess: (_, variables) => {
      // Làm mới danh sách đánh giá của buổi học sau khi lưu thành công (Invalide query lấy Session Feedback)
      queryClient.invalidateQueries({
        queryKey: queryKeys.feedback.bySession(variables.sessionId),
      });
      toastAdapter.success('Cập nhật đánh giá hiệu suất của học sinh thành công');
    },
    onError: (error: unknown) => {
      toastAdapter.error(mapHttpError(error));
    },
  });
};

/**
 * Hook cung cấp chức năng Nhập/Cập nhật Điểm thi. Phục vụ chuyên sâu cho các buổi học có yêu cầu bài test, giữa kỳ, cuối kỳ.
 */
export const useUpsertScore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      studentId,
      scoreType,
      payload,
    }: {
      sessionId: string;
      studentId: string;
      scoreType: ScoreTypeDto;
      payload: UpsertScoreDto;
    }) => upsertScore(sessionId, studentId, scoreType, payload),
    onSuccess: (_, variables) => {
      // Invalidate điểm theo Session để re-render lại bảng danh sách
      queryClient.invalidateQueries({
        queryKey: queryKeys.feedback.scoresBySession(variables.sessionId),
      });
      // Invalidate bảng báo cáo thành tích theo cá nhân học viên
      queryClient.invalidateQueries({
        queryKey: queryKeys.feedback.scoresByStudent(variables.studentId),
      });
      toastAdapter.success('Cập nhật điểm số cho học viên thành công');
    },
    onError: (error: unknown) => {
      toastAdapter.error(mapHttpError(error));
    },
  });
};

/**
 * Hook Mutation đóng vai trò như Trigger cho lệnh tải File Excel Báo cáo thành quả.
 * exportFeedbackExcel đã tự xử lý trigger download ngay trong service,
 * hook chỉ cần hiển thị toast phản hồi và xử lý lỗi.
 */
export const useExportFeedbackExcel = () => {
  return useMutation({
    mutationFn: ({
      classId,
      params,
    }: {
      classId: string;
      params: ExportFeedbackExcelParamsDto;
    }) => exportFeedbackExcel(classId, params),
    onSuccess: () => {
      // Download đã được trigger trong service, thông báo người dùng
      toastAdapter.success('Đang tải file Excel...');
    },
    onError: () => {
      // Override default mapHttpError for this specific requirement
      toastAdapter.error('Xuất file thất bại — vui lòng thử lại');
    },
  });
};

/**
 * Hook orchestration cho import feedback Excel theo 1 buổi học.
 *
 * Rules:
 * - Hook chỉ lo network + query invalidation (không ôm UI state).
 * - Không nuốt lỗi: để caller đọc `mutation.error`/`mutation.failureReason`.
 * - Expose `mutation.data` typed rõ cho UI render summary.
 */
export const useImportFeedbackExcel = (sessionId: string) => {
  const queryClient = useQueryClient();
  const [result, setResult] = useState<ImportFeedbackResultDto | null>(null);

  const mutation = useMutation<ImportFeedbackResultDto, unknown, File>({
    mutationFn: (file: File) => importFeedbackExcel(sessionId, file),
    onSuccess: async (data) => {
      // Lưu lại kết quả để modal render summary + bảng lỗi.
      setResult(data);

      // Chỉ refetch danh sách nếu có ít nhất 1 dòng import thành công.
      if (data.successCount > 0) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.feedback.bySession(sessionId),
        });
        await queryClient.refetchQueries({
          queryKey: queryKeys.feedback.bySession(sessionId),
        });
      }
    },
  });

  const errors = useMemo(() => result?.errors ?? [], [result]);

  return {
    // Action
    importFeedback: mutation.mutate,
    importFeedbackAsync: mutation.mutateAsync,

    // Pending/Error
    isPending: mutation.isPending,
    error: mutation.error,
    isError: mutation.isError,

    // Result (typed)
    result,
    errors,
    processedCount: result?.processedCount ?? 0,
    successCount: result?.successCount ?? 0,
    errorCount: result?.errorCount ?? 0,

    // Reset
    resetResult: () => setResult(null),
  };
};

/**
 * @deprecated Hook cũ (trộn toast/UI). Giữ lại để không vỡ nơi đang dùng.
 * Nên chuyển sang `useImportFeedbackExcel(sessionId)` và tự xử lý UI ở component.
 */
export const useImportFeedbackExcelLegacy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      file,
    }: {
      sessionId: string;
      file: File;
    }) => importFeedbackExcel(sessionId, file),
    onSuccess: (data: ImportFeedbackResultDto, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.feedback.bySession(variables.sessionId),
      });
      toastAdapter.success(`Nhập dữ liệu thành công (${data.processedCount} dòng)`);
    },
    onError: (error: unknown) => {
      toastAdapter.error(mapHttpError(error));
    },
  });
};
