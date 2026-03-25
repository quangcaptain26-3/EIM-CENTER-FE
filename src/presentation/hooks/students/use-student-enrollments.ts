import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/infrastructure/query/query-keys';
import { listStudentEnrollmentsUseCase } from '@/application/students/use-cases';

/**
 * Hook truy vấn danh sách lớp ghi danh của một học viên
 * @param studentId ID học viên
 */
export const useStudentEnrollments = (studentId?: string, options?: { includeAttendanceSummary?: boolean }) => {
  return useQuery({
    queryKey: [...queryKeys.students.enrollments(studentId!), options?.includeAttendanceSummary ?? true],
    queryFn: () =>
      listStudentEnrollmentsUseCase(studentId!, { includeAttendanceSummary: options?.includeAttendanceSummary ?? true }),
    enabled: !!studentId,
  });
};
