import { useQuery } from '@tanstack/react-query';
import {
  getAvailableCovers,
  getCenterSessions,
  getSession,
  getMySessions,
  type CenterSessionsParams,
} from '@/infrastructure/services/sessions.api';
import { getClassSessions } from '@/infrastructure/services/classes.api';
import { QUERY_KEYS } from '@/infrastructure/query/query-keys';
import {
  parseAvailableCovers,
  parseClassSessionsResponse,
  parseMySessionsBundle,
  parseSessionDetail,
} from '@/infrastructure/services/session-parse.util';

/** Buổi trong lớp — thay đổi thường xuyên */
const STALE_SESSIONS_LIVE_MS = 0;

export function useClassSessions(classId: string | undefined) {
  const q = useQuery({
    queryKey: QUERY_KEYS.CLASSES.sessions(classId ?? ''),
    queryFn: () => getClassSessions(classId!),
    enabled: Boolean(classId),
    staleTime: STALE_SESSIONS_LIVE_MS,
  });

  return {
    sessions: q.data ? parseClassSessionsResponse(q.data) : [],
    isLoading: q.isLoading,
    error: q.error,
    refetch: q.refetch,
  };
}

export interface MySessionsHookParams {
  /** YYYY-MM — ưu tiên khi có */
  monthKey?: string;
  month?: number;
  year?: number;
  enabled?: boolean;
}

/** ADMIN / Học vụ — lịch buổi toàn trung tâm */
export function useCenterSessions(params: CenterSessionsParams & MySessionsHookParams) {
  const apiParams: Record<string, unknown> = {};
  if (params.monthKey) {
    apiParams.month = params.monthKey;
  } else if (params.month != null && params.year != null) {
    apiParams.month = params.month;
    apiParams.year = params.year;
  }
  if (params.teacherId) apiParams.teacherId = params.teacherId;
  if (params.classId) apiParams.classId = params.classId;

  const q = useQuery({
    queryKey: QUERY_KEYS.SESSIONS.center(apiParams),
    queryFn: () => getCenterSessions(apiParams as CenterSessionsParams),
    enabled: (params.enabled ?? true) && Object.keys(apiParams).length > 0,
    staleTime: STALE_SESSIONS_LIVE_MS,
  });

  const bundle = q.data ? parseMySessionsBundle(q.data) : { sessions: [], summary: undefined };

  return {
    sessions: bundle.sessions,
    summary: bundle.summary,
    isLoading: q.isLoading,
    error: q.error,
    refetch: q.refetch,
  };
}

/** TEACHER — lịch buổi của tôi (tháng/năm hoặc monthKey) */
export function useMySessions(params: MySessionsHookParams) {
  const apiParams: Record<string, unknown> = {};
  if (params.monthKey) {
    apiParams.month = params.monthKey;
  } else if (params.month != null && params.year != null) {
    apiParams.month = params.month;
    apiParams.year = params.year;
  }

  const q = useQuery({
    queryKey: QUERY_KEYS.SESSIONS.my(apiParams),
    queryFn: () => getMySessions(apiParams),
    enabled: (params.enabled ?? true) && Object.keys(apiParams).length > 0,
    staleTime: STALE_SESSIONS_LIVE_MS,
  });

  const bundle = q.data ? parseMySessionsBundle(q.data) : { sessions: [], summary: undefined };

  return {
    sessions: bundle.sessions,
    summary: bundle.summary,
    isLoading: q.isLoading,
    error: q.error,
    refetch: q.refetch,
  };
}

export function useSessionDetail(sessionId: string | undefined) {
  const q = useQuery({
    queryKey: QUERY_KEYS.SESSIONS.detail(sessionId ?? ''),
    queryFn: async () => {
      const res = await getSession(sessionId!);
      return parseSessionDetail(res);
    },
    enabled: Boolean(sessionId),
    staleTime: STALE_SESSIONS_LIVE_MS,
  });

  return {
    session: q.data ?? null,
    isLoading: q.isLoading,
    error: q.error,
    refetch: q.refetch,
  };
}

/** GV cover — gọi khi modal mở (enabled) */
export function useAvailableCovers(sessionId: string | undefined, modalOpen = true) {
  const q = useQuery({
    queryKey: QUERY_KEYS.SESSIONS.availableCovers(sessionId ?? ''),
    queryFn: () => getAvailableCovers(sessionId!),
    enabled: Boolean(sessionId) && modalOpen,
    staleTime: STALE_SESSIONS_LIVE_MS,
  });

  return {
    teachers: q.data ? parseAvailableCovers(q.data) : [],
    raw: q.data,
    isLoading: q.isLoading,
    error: q.error,
    refetch: q.refetch,
  };
}
