import { useQuery } from '@tanstack/react-query';
import { getAttendanceHistory } from '@/infrastructure/services/students.api';
import { QUERY_KEYS } from '@/infrastructure/query/query-keys';
import { parseAttendanceHistory } from '@/infrastructure/services/student-parse.util';

/** Lịch sử điểm danh theo enrollment */
export function useAttendanceHistory(enrollmentId: string | undefined) {
  const q = useQuery({
    queryKey: QUERY_KEYS.ENROLLMENTS.attendance(enrollmentId ?? ''),
    queryFn: () => getAttendanceHistory(enrollmentId!),
    enabled: Boolean(enrollmentId),
    staleTime: 30_000,
  });

  return {
    history: q.data ? parseAttendanceHistory(q.data) : [],
    isLoading: q.isLoading,
    error: q.error,
    refetch: q.refetch,
  };
}
