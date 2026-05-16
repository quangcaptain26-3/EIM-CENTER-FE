import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { approveRefundRequest, createRefundRequest, listRefundRequests, rejectRefundRequest } from '@/infrastructure/services/refund.api';
import { QUERY_KEYS } from '@/infrastructure/query/query-keys';
import { parseRefundListResponse } from '@/infrastructure/services/refund-parse.util';
import { mutationToastApiError } from '@/presentation/hooks/toast-api-error';
import { toApiError } from '@/shared/lib/api-error';

export interface RefundListParams {
  page?: number;
  limit?: number;
  status?: string;
  reasonType?: string;
}

const STALE_REFUND_MS = 30_000;

type RefundRowCache = { id?: string; request_id?: string };

type RefundListCache = { data?: RefundRowCache[]; items?: RefundRowCache[]; total?: number };

function rowId(row: RefundRowCache): string {
  return String(row.id ?? row.request_id ?? '');
}

function invalidateRefundLists(
  qc: ReturnType<typeof useQueryClient>,
  listParams?: Record<string, unknown>,
) {
  if (listParams) {
    void qc.invalidateQueries({ queryKey: QUERY_KEYS.FINANCE.refundRequests(listParams) });
  }
  void qc.invalidateQueries({ queryKey: ['finance', 'refund-requests'] });
}

function patchRefundListCache(old: unknown, requestId: string): unknown {
  if (!old || typeof old !== 'object') return old;
  const o = old as RefundListCache;
  const source = Array.isArray(o.data) ? o.data : Array.isArray(o.items) ? o.items : null;
  if (!source) return old;
  const data = source.filter((row) => rowId(row) !== requestId);
  const removed = source.length - data.length;
  if (removed === 0) return old;
  return {
    ...o,
    ...(Array.isArray(o.data) ? { data } : {}),
    ...(Array.isArray(o.items) ? { items: data } : {}),
    total: Math.max(0, (o.total ?? source.length) - removed),
  };
}

export function useRefundRequests(params: RefundListParams = {}) {
  const apiParams = useMemo(
    () => ({
      page: params.page ?? 1,
      limit: params.limit ?? 50,
      ...(params.status ? { status: params.status } : {}),
      ...(params.reasonType ? { reasonType: params.reasonType } : {}),
    }),
    [params.page, params.limit, params.status, params.reasonType],
  );

  const q = useQuery({
    queryKey: QUERY_KEYS.FINANCE.refundRequests(apiParams),
    queryFn: () => listRefundRequests(apiParams),
    staleTime: STALE_REFUND_MS,
    placeholderData: (prev) => prev,
  });

  const parsed = useMemo(
    () => (q.data ? parseRefundListResponse(q.data) : { items: [], total: 0 }),
    [q.data],
  );

  return {
    items: parsed.items,
    total: parsed.total,
    isLoading: q.isLoading,
    isFetching: q.isFetching,
    error: q.error,
    refetch: q.refetch,
    listParams: apiParams,
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
      listParams?: Record<string, unknown>;
    }) => approveRefundRequest(id, { reviewNote, approvedAmount }),
    onMutate: ({ id, listParams }) => {
      if (!listParams) return {};
      const key = QUERY_KEYS.FINANCE.refundRequests(listParams);
      const previous = qc.getQueryData(key);
      qc.setQueryData(key, (old) => patchRefundListCache(old, id));
      return { previous, key };
    },
    onError: (err, vars, ctx) => {
      const apiErr = toApiError(err);
      if (apiErr?.httpStatus === 409) {
        invalidateRefundLists(qc, vars.listParams);
        toast.info(apiErr.message || 'Yêu cầu đã được xử lý. Đang cập nhật danh sách…');
        return;
      }
      if (ctx?.previous !== undefined && ctx.key) qc.setQueryData(ctx.key, ctx.previous);
      mutationToastApiError(err);
    },
    onSuccess: () => {
      toast.success('Đã duyệt hoàn phí');
    },
    onSettled: (_d, _e, vars) => {
      invalidateRefundLists(qc, vars.listParams);
    },
  });
}

export function useRejectRefundRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      reviewNote,
    }: {
      id: string;
      reviewNote: string;
      listParams?: Record<string, unknown>;
    }) => rejectRefundRequest(id, { requestId: id, status: 'rejected', reviewNote }),
    onMutate: ({ id, listParams }) => {
      if (!listParams) return {};
      const key = QUERY_KEYS.FINANCE.refundRequests(listParams);
      const previous = qc.getQueryData(key);
      qc.setQueryData(key, (old) => patchRefundListCache(old, id));
      return { previous, key };
    },
    onError: (err, vars, ctx) => {
      const apiErr = toApiError(err);
      if (apiErr?.httpStatus === 409) {
        invalidateRefundLists(qc, vars.listParams);
        toast.info(apiErr.message || 'Yêu cầu đã được xử lý. Đang cập nhật danh sách…');
        return;
      }
      if (ctx?.previous !== undefined && ctx.key) qc.setQueryData(ctx.key, ctx.previous);
      mutationToastApiError(err);
    },
    onSuccess: () => {
      toast.success('Đã từ chối hoàn phí');
    },
    onSettled: (_d, _e, vars) => {
      invalidateRefundLists(qc, vars.listParams);
    },
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
