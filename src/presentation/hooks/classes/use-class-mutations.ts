/**
 * Các hook mutation cho module Lớp học (Classes)
 * Sử dụng TanStack Query + classesApi, kèm invalidate cache và toast tiếng Việt.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/infrastructure/query/query-keys";
import { classesApi } from "@/infrastructure/services/classes.api";
import { toastAdapter } from "@/infrastructure/adapters/toast.adapter";
import { mapHttpError } from "@/infrastructure/http/http-error.mapper";
import type {
  AssignStaffRequestDto,
  CreateClassRequestDto,
  UpdateClassRequestDto,
} from "@/application/classes/dto/classes.dto";

/**
 * Hook tạo lớp học mới.
 * BE sinh sessions khi gửi `schedules` và `autoGenerateSessions !== false`.
 */
export const useCreateClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateClassRequestDto) =>
      classesApi.createClass(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.classes.all });
      toastAdapter.success("Tạo lớp học thành công");
    },
    onError: (error: unknown) => {
      toastAdapter.error(mapHttpError(error));
    },
  });
};

/**
 * Hook cập nhật thông tin lớp học.
 * @param classId ID lớp học cần cập nhật
 */
export const useUpdateClass = (classId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateClassRequestDto) => {
      if (!classId) {
        throw new Error("Thiếu ID lớp học");
      }
      return classesApi.updateClass(classId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.classes.all });
      if (classId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.classes.detail(classId),
        });
      }
      toastAdapter.success("Cập nhật thông tin lớp học thành công");
    },
    onError: (error: unknown) => {
      toastAdapter.error(mapHttpError(error));
    },
  });
};

/**
 * Hook phân công Staff (giáo viên/trợ giảng) vào lớp học.
 * @param classId ID lớp học
 */
export const useAssignStaff = (classId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AssignStaffRequestDto) => {
      if (!classId) {
        throw new Error("Thiếu ID lớp học");
      }
      return classesApi.assignStaff(classId, payload);
    },
    onSuccess: () => {
      if (classId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.classes.detail(classId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.classes.staff(classId),
        });
      }
      toastAdapter.success("Phân công nhân sự thành công");
    },
    onError: (error: unknown) => {
      toastAdapter.error(mapHttpError(error));
    },
  });
};

/**
 * Hook huỷ phân công Staff khỏi lớp học.
 * @param classId ID lớp học
 */
export const useRemoveStaff = (classId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AssignStaffRequestDto) => {
      if (!classId) {
        throw new Error("Thiếu ID lớp học");
      }
      return classesApi.removeStaff(classId, payload);
    },
    onSuccess: () => {
      if (classId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.classes.detail(classId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.classes.staff(classId),
        });
      }
      toastAdapter.success("Huỷ phân công nhân sự thành công");
    },
    onError: (error: unknown) => {
      toastAdapter.error(mapHttpError(error));
    },
  });
};

/**
 * Hook đóng lớp học (chuyển trạng thái sang CLOSED).
 * @param classId ID lớp học
 */
export const useCloseClass = (classId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      if (!classId) {
        throw new Error("Thiếu ID lớp học");
      }
      return classesApi.closeClass(classId);
    },
    onSuccess: () => {
      if (classId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.classes.all });
        queryClient.invalidateQueries({
          queryKey: queryKeys.classes.detail(classId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.classes.roster(classId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.classes.schedules(classId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.sessions.byClass(classId),
        });
      }
      toastAdapter.success("Đóng lớp học thành công");
    },
    onError: (error: unknown) => {
      toastAdapter.error(mapHttpError(error));
    },
  });
};

/**
 * Hook thêm học viên (enrollment) vào lớp học.
 * BE nhận: { enrollmentId } — thêm enrollment đã tồn tại
 *       hoặc { studentId, startDate } — tạo enrollment mới
 * @param classId ID lớp học
 */
export const useAddStudentToClass = <
  TPayload extends object = Record<string, unknown>,
  TResponse = unknown,
>(
  classId?: string,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TPayload) => {
      if (!classId) {
        throw new Error("Thiếu ID lớp học");
      }
      return classesApi.addEnrollment<TPayload, TResponse>(classId, payload);
    },
    onSuccess: () => {
      if (classId) {
        // Refresh roster list để hiện học viên mới
        queryClient.invalidateQueries({
          queryKey: queryKeys.classes.roster(classId),
        });
        // Refresh detail để cập nhật số sĩ số hiện tại
        queryClient.invalidateQueries({
          queryKey: queryKeys.classes.detail(classId),
        });
        // Refresh danh sách lớp tổng quát (có thể hiện sĩ số)
        queryClient.invalidateQueries({
          queryKey: queryKeys.classes.all,
        });
      }
      toastAdapter.success("Thêm học viên vào lớp thành công");
    },
    onError: (error: unknown) => {
      toastAdapter.error(mapHttpError(error));
    },
  });
};

