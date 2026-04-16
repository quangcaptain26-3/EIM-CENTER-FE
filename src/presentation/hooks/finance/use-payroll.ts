import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { finalizePayroll, getPayroll, getPayrolls, previewPayroll } from '@/infrastructure/services/finance.api';
import { QUERY_KEYS } from '@/infrastructure/query/query-keys';
import {
  parsePayrollDetail,
  parsePayrollListResponse,
  parsePayrollPreview,
} from '@/infrastructure/services/finance-parse.util';
import { toastApiError, toApiError } from '@/presentation/hooks/toast-api-error';

const STALE_PAYROLL_MS = 30_000;

export interface PayrollsListParams {
  page: number;
  limit: number;
  teacherId?: string;
  month?: number;
  year?: number;
}

export function usePayrolls(params: PayrollsListParams) {
  const apiParams: Record<string, unknown> = {
    page: params.page,
    limit: params.limit,
  };
  if (params.teacherId) apiParams.teacherId = params.teacherId;
  if (params.month != null) apiParams.month = params.month;
  if (params.year != null) apiParams.year = params.year;

  const q = useQuery({
    queryKey: QUERY_KEYS.FINANCE.payrolls(apiParams),
    queryFn: () => getPayrolls(apiParams),
    staleTime: STALE_PAYROLL_MS,
  });

  const parsed = q.data ? parsePayrollListResponse(q.data) : { items: [], total: 0, page: 1, limit: 20 };

  return {
    payrolls: parsed.items,
    total: parsed.total,
    page: parsed.page,
    limit: parsed.limit,
    isLoading: q.isLoading,
    error: q.error,
    refetch: q.refetch,
  };
}

/** @deprecated dùng usePayrolls */
export const usePayrollsList = usePayrolls;

export function usePayrollPreview(teacherId: string | undefined, month: number | undefined, year: number | undefined) {
  const enabled = Boolean(teacherId && month != null && year != null);
  const q = useQuery({
    queryKey:
      teacherId && month != null && year != null
        ? QUERY_KEYS.PAYROLL.preview(teacherId, month, year)
        : ['payroll', 'preview', 'disabled'],
    queryFn: () =>
      previewPayroll({
        teacherId: teacherId!,
        month: month!,
        year: year!,
      }),
    enabled,
    staleTime: 0,
  });

  return {
    preview: q.data ? parsePayrollPreview(q.data) : null,
    isLoading: q.isLoading,
    isFetching: q.isFetching,
    error: q.error,
    refetch: q.refetch,
  };
}

export function usePayroll(payrollId: string | undefined) {
  const q = useQuery({
    queryKey: QUERY_KEYS.FINANCE.payroll(payrollId ?? ''),
    queryFn: () => getPayroll(payrollId!),
    enabled: Boolean(payrollId),
    staleTime: STALE_PAYROLL_MS,
  });

  return {
    data: q.data ? parsePayrollDetail(q.data) : null,
    isLoading: q.isLoading,
    error: q.error,
    refetch: q.refetch,
  };
}

/** @deprecated dùng usePayroll */
export const usePayrollDetail = usePayroll;

export function useFinalizePayroll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { teacherId: string; month: number; year: number }) => finalizePayroll(body),
    onError: (err, variables) => {
      toastApiError(err);
      const e = toApiError(err);
      if (e?.code === 'PAYROLL_ALREADY_FINALIZED') {
        void qc.invalidateQueries({
          queryKey: QUERY_KEYS.PAYROLL.preview(variables.teacherId, variables.month, variables.year),
        });
      }
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ['payroll'] });
    },
  });
}
