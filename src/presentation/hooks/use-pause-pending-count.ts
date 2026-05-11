import { useQuery } from '@tanstack/react-query';
import { getPauseRequests } from '@/infrastructure/services/students.api';
import { QUERY_KEYS } from '@/infrastructure/query/query-keys';
import { parsePauseRequestsList } from '@/infrastructure/services/student-parse.util';

const STALE_PENDING_BADGE_MS = 15_000;

export function usePausePendingCount(enabled: boolean) {
  return useQuery({
    queryKey: QUERY_KEYS.PAUSE_REQUESTS.list({ status: 'pending' }),
    queryFn: () => getPauseRequests({ status: 'pending' }),
    enabled,
    staleTime: STALE_PENDING_BADGE_MS,
    select: (data) => parsePauseRequestsList(data).length,
  });
}
