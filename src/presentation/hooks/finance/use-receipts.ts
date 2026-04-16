import { useQuery } from '@tanstack/react-query';
import { getReceipt, getReceipts } from '@/infrastructure/services/finance.api';
import { QUERY_KEYS } from '@/infrastructure/query/query-keys';
import { parseReceipt, parseReceiptListResponse } from '@/infrastructure/services/finance-parse.util';
import { useCreateReceipt, useVoidReceipt } from '@/presentation/hooks/finance/use-finance-mutations';

export interface ReceiptsListParams {
  page: number;
  limit: number;
  studentId?: string;
  dateFrom?: string;
  dateTo?: string;
  paymentMethod?: 'cash' | 'transfer' | '';
}

const STALE_RECEIPTS_MS = 30_000;

export function useReceipts(params: ReceiptsListParams) {
  const apiParams: Record<string, unknown> = {
    page: params.page,
    limit: params.limit,
  };
  if (params.studentId) apiParams.studentId = params.studentId;
  if (params.dateFrom) apiParams.dateFrom = params.dateFrom;
  if (params.dateTo) apiParams.dateTo = params.dateTo;
  if (params.paymentMethod) apiParams.paymentMethod = params.paymentMethod;

  const q = useQuery({
    queryKey: QUERY_KEYS.FINANCE.receipts(apiParams),
    queryFn: () => getReceipts(apiParams),
    staleTime: STALE_RECEIPTS_MS,
  });

  const parsed = q.data ? parseReceiptListResponse(q.data) : { items: [], total: 0, page: 1, limit: 20 };

  return {
    receipts: parsed.items,
    total: parsed.total,
    page: parsed.page,
    limit: parsed.limit,
    isLoading: q.isLoading,
    isFetching: q.isFetching,
    error: q.error,
    refetch: q.refetch,
  };
}

/** @deprecated dùng useReceipts */
export const useReceiptsList = useReceipts;

export function useReceipt(receiptId: string | undefined) {
  const q = useQuery({
    queryKey: QUERY_KEYS.FINANCE.receipt(receiptId ?? ''),
    queryFn: () => getReceipt(receiptId!),
    enabled: Boolean(receiptId),
    staleTime: STALE_RECEIPTS_MS,
  });

  return {
    receipt: q.data ? parseReceipt(q.data) : null,
    isLoading: q.isLoading,
    error: q.error,
    refetch: q.refetch,
  };
}

export { useCreateReceipt, useVoidReceipt };
