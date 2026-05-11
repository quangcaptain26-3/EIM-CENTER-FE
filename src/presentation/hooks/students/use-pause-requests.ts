import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { approvePauseRequest, getPauseRequests, rejectPauseRequest } from '@/infrastructure/services/students.api';
import { QUERY_KEYS } from '@/infrastructure/query/query-keys';
import { parsePauseRequestsList } from '@/infrastructure/services/student-parse.util';
import { mutationToastApiError } from '@/presentation/hooks/toast-api-error';

export interface PauseRequestsParams {
  status?: 'pending' | 'approved' | 'rejected' | string;
  page?: number;
  limit?: number;
}

const STALE_PAUSE_MS = 30_000;
/** Danh sách chờ duyệt — badge sidebar cần gần real-time hơn */
const STALE_PAUSE_PENDING_MS = 15_000;

export function usePauseRequests(params: PauseRequestsParams = {}) {
  const isPendingOnly = params.status === 'pending';
  const q = useQuery({
    queryKey: QUERY_KEYS.PAUSE_REQUESTS.list(params),
    queryFn: () => getPauseRequests(params as Record<string, unknown>),
    staleTime: isPendingOnly ? STALE_PAUSE_PENDING_MS : STALE_PAUSE_MS,
  });

  return {
    items: q.data ? parsePauseRequestsList(q.data) : [],
    isLoading: q.isLoading,
    error: q.error,
    refetch: q.refetch,
  };
}

/** @deprecated dùng usePauseRequests */
export const usePauseRequestsList = usePauseRequests;

/** @deprecated Dùng usePauseRequests({ status: 'pending' }) */
export function usePauseRequestsPending() {
  return usePauseRequests({ status: 'pending' });
}

export function useApprovePauseRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      reviewNote,
    }: {
      id: string;
      studentId?: string;
      reviewNote?: string;
    }) => approvePauseRequest(id, reviewNote),
    onSuccess: (_d, { studentId }) => {
      toast.success('Đã duyệt bảo lưu');
      void qc.invalidateQueries({ queryKey: ['pause-requests'] });
      void qc.invalidateQueries({ queryKey: ['students'] });
      if (studentId) {
        void qc.invalidateQueries({ queryKey: QUERY_KEYS.STUDENTS.enrollments(studentId) });
        void qc.invalidateQueries({ queryKey: QUERY_KEYS.STUDENTS.detail(studentId) });
      }
    },
    onError: mutationToastApiError,
  });
}

export function useRejectPauseRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      reviewNote,
    }: {
      id: string;
      reviewNote: string;
      studentId?: string;
    }) => rejectPauseRequest(id, reviewNote),
    onSuccess: (_d, { studentId }) => {
      toast.success('Đã từ chối yêu cầu');
      void qc.invalidateQueries({ queryKey: ['pause-requests'] });
      if (studentId) {
        void qc.invalidateQueries({ queryKey: QUERY_KEYS.STUDENTS.enrollments(studentId) });
        void qc.invalidateQueries({ queryKey: QUERY_KEYS.STUDENTS.detail(studentId) });
      }
    },
    onError: mutationToastApiError,
  });
}
