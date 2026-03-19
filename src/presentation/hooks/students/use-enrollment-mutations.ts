import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/infrastructure/query/query-keys';
import { 
  createEnrollmentUseCase, 
  updateEnrollmentStatusUseCase, 
  transferEnrollmentUseCase 
} from '@/application/students/use-cases';
import { toastAdapter } from '@/infrastructure/adapters/toast.adapter';
import { mapHttpError } from '@/infrastructure/http/http-error.mapper';
import type { 
  CreateEnrollmentRequestDto, 
  UpdateEnrollmentStatusRequestDto, 
  TransferEnrollmentRequestDto 
} from '@/application/students/dto/enrollment.dto';

/**
 * Hook thêm học viên vào lớp (Ghi danh mới)
 * @param studentId Tùy chọn truyền vào để refresh query nội bộ của học viên đó
 */
export const useCreateEnrollment = (studentId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEnrollmentRequestDto) => createEnrollmentUseCase(payload),
    onSuccess: (_, variables) => {
      if (studentId) {
        // Làm mới danh sách ghi danh của học viên
        queryClient.invalidateQueries({ queryKey: queryKeys.students.enrollments(studentId) });
        // Làm mới chi tiết học viên (để cập nhật số lượng ghi danh nếu có hiển thị)
        queryClient.invalidateQueries({ queryKey: queryKeys.students.detail(studentId) });
      }

      // Invalidate roster của lớp để học viên mới xuất hiện ngay lập tức
      if (variables.classId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.classes.roster(variables.classId) });
        // Refresh chi tiết lớp để cập nhật sĩ số hiện tại
        queryClient.invalidateQueries({ queryKey: queryKeys.classes.detail(variables.classId) });
      }

      // Refresh lại danh sách lớp tổng quát
      queryClient.invalidateQueries({ queryKey: queryKeys.classes.all });
      toastAdapter.success('Ghi danh học viên thành công');
    },
    onError: (error) => {
      toastAdapter.error(mapHttpError(error));
    },
  });
};

/**
 * Hook cập nhật trạng thái ghi danh (Bảo lưu, Thôi học...)
 */
export const useUpdateEnrollmentStatus = (studentId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ enrollmentId, payload }: { enrollmentId: string; payload: UpdateEnrollmentStatusRequestDto }) => 
      updateEnrollmentStatusUseCase(enrollmentId, payload),
    onSuccess: (data: any) => {
      if (studentId) {
        // Cập nhật lại lịch sử ghi danh và chi tiết học viên
        queryClient.invalidateQueries({ queryKey: queryKeys.students.enrollments(studentId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.students.detail(studentId) });
      }
      
      // Invalidate roster của lớp để phản ánh trạng thái mới của học viên
      if (data?.classId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.classes.roster(data.classId) });
      }

      // Refresh danh sách lớp chung
      queryClient.invalidateQueries({ queryKey: queryKeys.classes.all });
      toastAdapter.success('Cập nhật trạng thái tham gia thành công');
    },
    onError: (error) => {
      toastAdapter.error(mapHttpError(error));
    },
  });
};

/**
 * Hook chuyển lớp cho học viên
 */
export const useTransferEnrollment = (studentId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ enrollmentId, payload }: { enrollmentId: string; payload: TransferEnrollmentRequestDto }) => 
      transferEnrollmentUseCase(enrollmentId, payload),
    onSuccess: (data: any) => {
      if (studentId) {
        // Cập nhật lại danh sách ghi danh vì có enrollment mới được tạo ra
        queryClient.invalidateQueries({ queryKey: queryKeys.students.enrollments(studentId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.students.detail(studentId) });
      }

      // Invalidate roster lớp đích (bắt buộc — học viên phải xuất hiện ở lớp mới)
      if (data?.newEnrollment?.classId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.classes.roster(data.newEnrollment.classId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.classes.detail(data.newEnrollment.classId) });
      }

      // Invalidate roster lớp cũ (để xóa hoặc cập nhật trạng thái học viên ở lớp nguồn)
      if (data?.oldEnrollment?.classId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.classes.roster(data.oldEnrollment.classId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.classes.detail(data.oldEnrollment.classId) });
      }

      // Refresh danh sách lớp để cập nhật sĩ số các lớp liên quan
      queryClient.invalidateQueries({ queryKey: queryKeys.classes.all });
      toastAdapter.success('Chuyển lớp học viên thành công');
    },
    onError: (error) => {
      toastAdapter.error(mapHttpError(error));
    },
  });
};
