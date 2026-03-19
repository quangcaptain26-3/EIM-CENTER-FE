import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { queryKeys } from '@/infrastructure/query/query-keys';
import { listStudentsUseCase, getStudentUseCase } from '@/application/students/use-cases';
import type { ListStudentsQueryDto } from '@/application/students/dto/student.dto';

/**
 * Hook truy vấn danh sách học viên
 * @param params Tham số tìm kiếm, phân trang
 */
export const useStudents = (params?: ListStudentsQueryDto) => {
  return useQuery({
    queryKey: queryKeys.students.list(params),
    queryFn: () => listStudentsUseCase(params),
    placeholderData: keepPreviousData, // Giữ data cũ khi chuyển trang
  });
};

/**
 * Hook truy vấn chi tiết học viên
 * @param studentId ID học viên
 */
export const useStudent = (studentId?: string) => {
  return useQuery({
    queryKey: queryKeys.students.detail(studentId!),
    queryFn: () => getStudentUseCase(studentId!),
    enabled: !!studentId, // Chỉ fetch khi có ID
  });
};
