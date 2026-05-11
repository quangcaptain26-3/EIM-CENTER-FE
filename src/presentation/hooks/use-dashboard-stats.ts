import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '@/infrastructure/services/dashboard.api';
import { QUERY_KEYS } from '@/infrastructure/query/query-keys';

const STALE_MS = 2 * 60 * 1000;
const REFETCH_MS = 5 * 60 * 1000;

export function useDashboardStats(enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.DASHBOARD.stats,
    queryFn: getDashboardStats,
    enabled,
    staleTime: STALE_MS,
    refetchInterval: REFETCH_MS,
  });
}
