import { useQuery } from '@tanstack/react-query';
import { getDebt, getDashboard, getPaymentStatus } from '@/infrastructure/services/finance.api';
import { QUERY_KEYS } from '@/infrastructure/query/query-keys';
import {
  parseDebtSummary,
  parseFinanceDashboard,
  parsePaymentStatusListResponse,
} from '@/infrastructure/services/finance-parse.util';

const STALE_FINANCE_MS = 30_000;

export function useDebt(enrollmentId: string | undefined) {
  const q = useQuery({
    queryKey: QUERY_KEYS.FINANCE.debt(enrollmentId ?? ''),
    queryFn: () => getDebt(enrollmentId!),
    enabled: Boolean(enrollmentId),
    staleTime: STALE_FINANCE_MS,
  });

  return {
    debt: q.data ? parseDebtSummary(q.data) : null,
    isLoading: q.isLoading,
    error: q.error,
    refetch: q.refetch,
  };
}

/** @deprecated dùng useDebt */
export const useEnrollmentDebt = useDebt;

export interface PaymentStatusParams {
  page: number;
  limit: number;
  hasDebt?: boolean;
  classId?: string;
  programId?: string;
  programCode?: string;
}

export function usePaymentStatus(params: PaymentStatusParams) {
  const apiParams: Record<string, unknown> = {
    page: params.page,
    limit: params.limit,
  };
  if (params.hasDebt !== undefined) apiParams.hasDebt = params.hasDebt;
  if (params.classId) apiParams.classId = params.classId;
  if (params.programId) apiParams.programId = params.programId;
  if (params.programCode) apiParams.programCode = params.programCode;

  const q = useQuery({
    queryKey: QUERY_KEYS.FINANCE.paymentStatus(apiParams),
    queryFn: () => getPaymentStatus(apiParams),
    staleTime: STALE_FINANCE_MS,
  });

  const parsed = q.data ? parsePaymentStatusListResponse(q.data) : { items: [], total: 0, page: 1, limit: 20 };

  return {
    rows: parsed.items,
    total: parsed.total,
    page: parsed.page,
    limit: parsed.limit,
    isLoading: q.isLoading,
    error: q.error,
    refetch: q.refetch,
  };
}

/** @deprecated dùng usePaymentStatus */
export const usePaymentStatusList = usePaymentStatus;

export interface DashboardParams {
  month?: number;
  year: number;
  quarter?: number;
  yearFrom?: number;
  yearTo?: number;
}

export function useFinanceDashboard(params: DashboardParams) {
  const apiParams: Record<string, unknown> = { year: params.year };
  if (params.month != null) apiParams.month = params.month;
  if (params.quarter != null) apiParams.quarter = params.quarter;
  if (params.yearFrom != null) apiParams.yearFrom = params.yearFrom;
  if (params.yearTo != null) apiParams.yearTo = params.yearTo;

  const q = useQuery({
    queryKey: QUERY_KEYS.FINANCE.dashboard(apiParams),
    queryFn: () => getDashboard(apiParams),
    staleTime: STALE_FINANCE_MS,
  });

  return {
    dashboard: q.data ? parseFinanceDashboard(q.data) : null,
    isLoading: q.isLoading,
    error: q.error,
    refetch: q.refetch,
  };
}
