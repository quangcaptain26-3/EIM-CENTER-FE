import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/infrastructure/query/query-keys';
import { createStudentUseCase, updateStudentUseCase } from '@/application/students/use-cases';
import { toastAdapter } from '@/infrastructure/adapters/toast.adapter';
import { mapHttpError } from '@/infrastructure/http/http-error.mapper';

/**
 * Hook tạo học viên mới
 */
export const useCreateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStudentUseCase,
    onSuccess: () => {
      // Refresh lại danh sách tổng
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
      toastAdapter.success('Thêm học viên thành công');
    },
    onError: (error) => {
      toastAdapter.error(mapHttpError(error));
    },
  });
};

/**
 * Hook cập nhật thông tin học viên
 * @param studentId ID của học viên đang chỉnh sửa
 */
export const useUpdateStudent = (studentId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Parameters<typeof updateStudentUseCase>[1]) => {
      if (!studentId) throw new Error('Thiếu ID học viên');
      return updateStudentUseCase(studentId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
      // Refresh detail trực tiếp nếu đang mở popup/page detail
      if (studentId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.students.detail(studentId) });
      }
      toastAdapter.success('Cập nhật học viên thành công');
    },
    onError: (error) => {
      toastAdapter.error(mapHttpError(error));
    },
  });
};
