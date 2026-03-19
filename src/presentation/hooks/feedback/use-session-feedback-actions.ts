import { useMutation } from "@tanstack/react-query";
import type { ExportFeedbackExcelParamsDto } from "@/application/feedback/dto/feedback.dto";
import { downloadFeedbackTemplate, exportFeedbackReport } from "@/infrastructure/services/feedback.api";

export interface UseSessionFeedbackActionsParams {
  sessionId: string;
  classId: string;
}

/**
 * Hook gom nhóm action IO của trang Session Feedback.
 *
 * Quy ước:
 * - Hook chỉ làm IO + expose trạng thái pending/error.
 * - Không toast trong hook để UI toàn quyền quyết định cách thông báo.
 */
export const useSessionFeedbackActions = ({ sessionId, classId }: UseSessionFeedbackActionsParams) => {
  const downloadTemplateMutation = useMutation({
    mutationFn: async () => {
      await downloadFeedbackTemplate(sessionId);
    },
  });

  const exportReportMutation = useMutation({
    mutationFn: async (params: ExportFeedbackExcelParamsDto) => {
      await exportFeedbackReport({ classId, ...params });
    },
  });

  return {
    downloadTemplate: downloadTemplateMutation.mutateAsync,
    isDownloadingTemplate: downloadTemplateMutation.isPending,
    downloadTemplateError: downloadTemplateMutation.error,

    exportReport: exportReportMutation.mutateAsync,
    isExportingReport: exportReportMutation.isPending,
    exportReportError: exportReportMutation.error,
  };
};

