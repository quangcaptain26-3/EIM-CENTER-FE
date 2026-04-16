import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { approveRefundRequest, createRefundRequest, listRefundRequests, rejectRefundRequest } from '@/infrastructure/services/refund.api';
import { QUERY_KEYS } from '@/infrastructure/query/query-keys';
import { parseRefundListResponse } from '@/infrastructure/services/refund-parse.util';
import { mutationToastApiError } from '@/presentation/hooks/toast-api-error';

export interface RefundListParams {
  page?: number;
  limit?: number;
  status?: string;
  reasonType?: string;
}

const STALE_REFUND_MS = 30_000;

export function useRefundRequests(params: RefundListParams = {}) {
  const apiParams: Record<string, unknown> = {
    page: params.page ?? 1,
    limit: params.limit ?? 50,
  };
  if (params.status) apiParams.status = params.status;
  if (params.reasonType) apiParams.reasonType = params.reasonType;

  const q = useQuery({
    queryKey: QUERY_KEYS.FINANCE.refundRequests(apiParams),
    queryFn: () => listRefundRequests(apiParams),
    staleTime: STALE_REFUND_MS,
  });

  const parsed = q.data ? parseRefundListResponse(q.data) : { items: [], total: 0 };

  return {
    items: parsed.items,
    total: parsed.total,
    isLoading: q.isLoading,
    error: q.error,
    refetch: q.refetch,
  };
}

/** @deprecated dùng useRefundRequests */
export const useRefundRequestsList = useRefundRequests;

export function useApproveRefundRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      reviewNote,
      approvedAmount,
    }: {
      id: string;
      reviewNote: string;
      approvedAmount?: number;
    }) => approveRefundRequest(id, { reviewNote, approvedAmount }),
    onSuccess: () => {
      toast.success('Đã duyệt hoàn phí');
      void qc.invalidateQueries({ queryKey: ['finance', 'refund-requests'] });
    },
    onError: mutationToastApiError,
  });
}

export function useRejectRefundRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reviewNote }: { id: string; reviewNote: string }) =>
      rejectRefundRequest(id, { requestId: id, status: 'rejected', reviewNote }),
    onSuccess: () => {
      toast.success('Đã từ chối hoàn phí');
      void qc.invalidateQueries({ queryKey: ['finance', 'refund-requests'] });
    },
    onError: mutationToastApiError,
  });
}

export function useCreateRefundRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => createRefundRequest(data),
    onSuccess: () => {
      toast.success('Đã gửi yêu cầu hoàn phí');
      void qc.invalidateQueries({ queryKey: ['finance', 'refund-requests'] });
    },
    onError: mutationToastApiError,
  });
}
