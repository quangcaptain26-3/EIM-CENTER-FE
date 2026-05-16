import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getClass,
  getClassAttendanceMatrix,
  getClasses,
  getPrograms,
  getRoster,
  getRooms,
  getUpcomingClasses,
  updateProgramDefaultFee,
} from '@/infrastructure/services/classes.api';
import { QUERY_KEYS } from '@/infrastructure/query/query-keys';
import {
  parseClassDetail,
  parseClassListResponse,
  parseProgramsResponse,
  parseRosterResponse,
  parseRoomsResponse,
} from '@/infrastructure/services/class-parse.util';

export interface ClassesListParams {
  page: number;
  limit: number;
  programId?: string;
  status?: string;
  search?: string;
  /** SHIFT_1 | SHIFT_2 */
  shift?: string;
}

const STALE_REFERENCE_MS = 30_000;

export function useClasses(params: ClassesListParams) {
  const apiParams: Record<string, unknown> = {
    page: params.page,
    limit: params.limit,
  };
  if (params.programId) apiParams.programId = params.programId;
  if (params.status) apiParams.status = params.status;
  if (params.search?.trim()) apiParams.search = params.search.trim();
  if (params.shift) apiParams.shift = params.shift;

  const q = useQuery({
    queryKey: QUERY_KEYS.CLASSES.list(apiParams),
    queryFn: () => getClasses(apiParams),
    staleTime: STALE_REFERENCE_MS,
  });

  const parsed = q.data ? parseClassListResponse(q.data) : { items: [], total: 0 };

  return {
    classes: parsed.items,
    total: parsed.total,
    isLoading: q.isLoading,
    isFetching: q.isFetching,
    error: q.error,
    refetch: q.refetch,
  };
}

/** @deprecated dùng useClasses */
export const useClassesList = useClasses;

export function useClass(classId: string | undefined) {
  const q = useQuery({
    queryKey: QUERY_KEYS.CLASSES.detail(classId ?? ''),
    queryFn: () => getClass(classId!),
    enabled: Boolean(classId),
    staleTime: STALE_REFERENCE_MS,
  });

  return {
    classDetail: q.data ? parseClassDetail(q.data) : null,
    isLoading: q.isLoading,
    error: q.error,
    refetch: q.refetch,
  };
}

export function useClassRoster(classId: string | undefined) {
  const q = useQuery({
    queryKey: QUERY_KEYS.CLASSES.roster(classId ?? ''),
    queryFn: () => getRoster(classId!),
    enabled: Boolean(classId),
    // Attendance-derived numbers (sessions_attended, makeup_blocked, etc.)
    // cần nhìn "real-time-ish" cho học vụ/admin sau khi GV vừa submit.
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  return {
    roster: q.data ? parseRosterResponse(q.data) : [],
    isLoading: q.isLoading,
    error: q.error,
    refetch: q.refetch,
  };
}

export function useClassAttendanceMatrix(classId: string | undefined) {
  const q = useQuery({
    queryKey: QUERY_KEYS.CLASSES.attendanceMatrix(classId ?? ''),
    queryFn: () => getClassAttendanceMatrix(classId!),
    enabled: Boolean(classId),
    // Giảm cache để trang "Điểm danh" phản ánh ngay khi GV submit.
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
  return {
    matrix: q.data ?? null,
    isLoading: q.isLoading,
    error: q.error,
    refetch: q.refetch,
  };
}

export function useRooms() {
  return useQuery({
    queryKey: QUERY_KEYS.REFERENCE.rooms,
    queryFn: () => getRooms(),
    staleTime: STALE_REFERENCE_MS,
  });
}

export function usePrograms() {
  return useQuery({
    queryKey: QUERY_KEYS.REFERENCE.programs,
    queryFn: () => getPrograms(),
    staleTime: STALE_REFERENCE_MS,
  });
}

export function useParsedRooms() {
  const q = useRooms();
  return {
    rooms: q.data ? parseRoomsResponse(q.data) : [],
    isLoading: q.isLoading,
    refetch: q.refetch,
  };
}

export function useParsedPrograms() {
  const q = usePrograms();
  return {
    programs: q.data ? parseProgramsResponse(q.data) : [],
    isLoading: q.isLoading,
    refetch: q.refetch,
  };
}

export function useUpdateProgramDefaultFee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ programId, defaultFee }: { programId: string; defaultFee: number }) =>
      updateProgramDefaultFee(programId, { defaultFee }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REFERENCE.programs });
    },
  });
}

export function useUpcomingClasses() {
  const q = useQuery({
    queryKey: ['classes', 'upcoming'],
    queryFn: () => getUpcomingClasses(),
    staleTime: STALE_REFERENCE_MS,
  });

  const parsed = q.data ? parseClassListResponse(q.data) : { items: [], total: 0 };
  return {
    classes: parsed.items,
    isLoading: q.isLoading,
    error: q.error,
    refetch: q.refetch,
  };
}
