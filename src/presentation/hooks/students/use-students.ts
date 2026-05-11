import { useQuery } from '@tanstack/react-query';
import { getEnrollments, getStudent, getStudents } from '@/infrastructure/services/students.api';
import { searchStudents } from '@/infrastructure/services/system.api';
import { QUERY_KEYS } from '@/infrastructure/query/query-keys';
import {
  parseEnrollmentsList,
  parseStudentDetail,
  parseStudentListResponse,
  parseStudentSearchBundle,
} from '@/infrastructure/services/student-parse.util';

export interface StudentsListParams {
  page: number;
  limit: number;
  search?: string;
  programId?: string;
  level?: string;
  enrollmentStatus?: string;
  classId?: string;
}

const STALE_STUDENTS_MS = 30_000;

export function useStudents(params: StudentsListParams) {
  const apiParams: Record<string, unknown> = { page: params.page, limit: params.limit };
  if (params.search?.trim()) apiParams.search = params.search.trim();
  if (params.programId?.trim()) apiParams.programId = params.programId.trim();
  if (params.level?.trim()) apiParams.level = params.level.trim();
  if (params.enrollmentStatus?.trim()) apiParams.enrollmentStatus = params.enrollmentStatus.trim();
  if (params.classId?.trim()) apiParams.classId = params.classId.trim();

  const q = useQuery({
    queryKey: QUERY_KEYS.STUDENTS.list(apiParams),
    queryFn: () => getStudents(apiParams),
    staleTime: STALE_STUDENTS_MS,
  });

  const parsed = q.data ? parseStudentListResponse(q.data) : { items: [], total: 0 };

  return {
    students: parsed.items,
    total: parsed.total,
    isLoading: q.isLoading,
    isFetching: q.isFetching,
    error: q.error,
    refetch: q.refetch,
  };
}

/** @deprecated dùng useStudents */
export const useStudentsList = useStudents;

export function useStudent(studentId: string | undefined) {
  const q = useQuery({
    queryKey: QUERY_KEYS.STUDENTS.detail(studentId ?? ''),
    queryFn: () => getStudent(studentId!),
    enabled: Boolean(studentId),
    staleTime: STALE_STUDENTS_MS,
  });

  return {
    student: q.data ? parseStudentDetail(q.data) : null,
    isLoading: q.isLoading,
    error: q.error,
    refetch: q.refetch,
  };
}

export function useStudentEnrollments(studentId: string | undefined) {
  const q = useQuery({
    queryKey: QUERY_KEYS.STUDENTS.enrollments(studentId ?? ''),
    queryFn: () => getEnrollments(studentId!),
    enabled: Boolean(studentId),
    staleTime: STALE_STUDENTS_MS,
  });

  return {
    enrollments: q.data ? parseEnrollmentsList(q.data) : [],
    isLoading: q.isLoading,
    refetch: q.refetch,
  };
}

export function useStudentSearchSuggestions(query: string, enabled = true) {
  const q = query.trim();
  const qy = useQuery({
    queryKey: QUERY_KEYS.SEARCH.students(q),
    queryFn: () => searchStudents({ q, limit: 12 }),
    enabled: enabled && q.length >= 1,
    staleTime: 30_000,
  });

  const bundle = qy.data ? parseStudentSearchBundle(qy.data) : { students: [], byPhone: [] };

  return {
    students: bundle.students,
    byPhone: bundle.byPhone,
    isLoading: qy.isFetching,
  };
}
