import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/infrastructure/query/query-keys";
import { SessionsApiService } from "@/infrastructure/services/sessions.api";
import { toastAdapter } from "@/infrastructure/adapters/toast.adapter";
import { mapHttpError } from "@/infrastructure/http/http-error.mapper";
import type { GenerateSessionsDto, UpdateSessionDto } from "@/application/sessions/dto/sessions.dto";

/**
 * Sinh (hoặc sinh lại) toàn bộ buổi học cho lớp đã có lịch cố định.
 * POST /classes/:id/sessions/generate
 */
export const useGenerateSessions = (classId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: GenerateSessionsDto = {}) => {
      if (!classId) {
        throw new Error("Thiếu ID lớp học");
      }
      return SessionsApiService.generateSessions(classId, payload);
    },
    onSuccess: () => {
      if (classId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.sessions.byClass(classId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.classes.detail(classId),
        });
      }
      toastAdapter.success("Đã sinh buổi học thành công");
    },
    onError: (error: unknown) => {
      toastAdapter.error(mapHttpError(error));
    },
  });
};

/**
 * Hook thực hiện cập nhật thông tin chung của một buổi học (đổi lịch, note, sửa nội dung bài).
 * @param classId Truyền vào ID của lớp học để refetch dữ liệu class list sessions sau khi thành công.
 */
export const useUpdateSession = (classId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      payload,
    }: {
      sessionId: string;
      payload: UpdateSessionDto;
    }) => {
      if (!sessionId) {
        throw new Error("Thiếu định danh ID của buổi học");
      }
      return SessionsApiService.updateSession(sessionId, payload);
    },
    onSuccess: (_, variables) => {
      // Làm mới lại query cho cache chi tiết session
      queryClient.invalidateQueries({
        queryKey: queryKeys.sessions.detail(variables.sessionId),
      });

      // Làm mới lại query danh sách các session thuộc class (nếu có context class)
      if (classId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.sessions.byClass(classId),
        });
      }

      toastAdapter.success("Cập nhật thông tin buổi học thành công");
    },
    onError: (error: unknown) => {
      toastAdapter.error(mapHttpError(error));
    },
  });
};

/**
 * Hook chuyên biệt gán (hoặc gỡ) giáo viên dạy thay (Cover Teacher)
 * cho một buổi học được chỉ định.
 * @param classId Giới hạn context về phạm vi lớp học hiện tại
 */
export const useSetCoverTeacher = (classId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      coverTeacherId,
    }: {
      sessionId: string;
      coverTeacherId: string | null;
    }) => {
      if (!sessionId) {
        throw new Error("Thiếu định danh ID của buổi học");
      }
      return SessionsApiService.setSessionCoverTeacher(sessionId, coverTeacherId);
    },
    onSuccess: (_, variables) => {
      // Invalidate detail cache của phiên học bị can thiệp
      queryClient.invalidateQueries({
        queryKey: queryKeys.sessions.detail(variables.sessionId),
      });

      // Invalidate data mảng lớn của lớp học đó
      if (classId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.sessions.byClass(classId),
        });
      }

      toastAdapter.success(
        variables.coverTeacherId
          ? "Gán giáo viên dạy thay thành công"
          : "Gỡ giáo viên dạy thay thành công"
      );
    },
    onError: (error: unknown) => {
      toastAdapter.error(mapHttpError(error));
    },
  });
};
