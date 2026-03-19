import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/infrastructure/query/query-keys';
import { listStudentEnrollmentsUseCase } from '@/application/students/use-cases';

/**
 * Hook truy vấn danh sách lớp ghi danh của một học viên
 * @param studentId ID học viên
 */
export const useStudentEnrollments = (studentId?: string) => {
  return useQuery({
    queryKey: queryKeys.students.enrollments(studentId!),
    queryFn: () => listStudentEnrollmentsUseCase(studentId!),
    enabled: !!studentId, // Chỉ fetch khi có ID hơp lệ
  });
};
