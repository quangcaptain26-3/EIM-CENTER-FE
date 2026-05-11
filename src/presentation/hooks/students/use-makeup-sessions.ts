import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  cancelMakeupSession,
  completeMakeupSession,
  createMakeupSession,
  getMakeupSessions,
} from '@/infrastructure/services/students.api';
import { QUERY_KEYS } from '@/infrastructure/query/query-keys';
import { parseMakeupSessionsList } from '@/infrastructure/services/student-parse.util';
import { mutationToastApiError } from '@/presentation/hooks/toast-api-error';

export interface MakeupSessionsParams {
  status?: string;
  enrollmentId?: string;
  page?: number;
  limit?: number;
}

const STALE_MAKEUP_MS = 30_000;

export function useMakeupSessions(params: MakeupSessionsParams = {}) {
  const apiParams: Record<string, unknown> = {};
  if (params.status) apiParams.status = params.status;
  if (params.enrollmentId) apiParams.enrollmentId = params.enrollmentId;
  if (params.page != null) apiParams.page = params.page;
  if (params.limit != null) apiParams.limit = params.limit;

  const q = useQuery({
    queryKey: QUERY_KEYS.MAKEUP_SESSIONS.list(apiParams),
    queryFn: () => getMakeupSessions(apiParams),
    staleTime: STALE_MAKEUP_MS,
  });

  return {
    items: q.data ? parseMakeupSessionsList(q.data) : [],
    isLoading: q.isLoading,
    error: q.error,
    refetch: q.refetch,
  };
}

/** @deprecated dùng useMakeupSessions */
export const useMakeupSessionsList = useMakeupSessions;

export function useCreateMakeupSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => createMakeupSession(data),
    onSuccess: () => {
      toast.success('Đã tạo buổi bù');
      void qc.invalidateQueries({ queryKey: ['makeup-sessions'] });
    },
    onError: mutationToastApiError,
  });
}

export function useCompleteMakeupSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => completeMakeupSession(id),
    onSuccess: () => {
      toast.success('Đã hoàn thành buổi bù');
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.MAKEUP_SESSIONS.list({}) });
      void qc.invalidateQueries({ queryKey: ['makeup-sessions'] });
    },
    onError: mutationToastApiError,
  });
}

export function useCancelMakeupSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelMakeupSession(id),
    onSuccess: () => {
      toast.success('Đã hủy buổi bù');
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.MAKEUP_SESSIONS.list({}) });
      void qc.invalidateQueries({ queryKey: ['makeup-sessions'] });
    },
    onError: mutationToastApiError,
  });
}
