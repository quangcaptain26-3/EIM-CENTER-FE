import { useQuery } from '@tanstack/react-query';
import { getUser } from '@/infrastructure/services/users.api';
import { QUERY_KEYS } from '@/infrastructure/query/query-keys';
import { parseStaffUserDetail } from '@/infrastructure/services/user-detail.util';

export function useUser(id: string | undefined) {
  const q = useQuery({
    queryKey: QUERY_KEYS.USERS.detail(id ?? ''),
    queryFn: () => getUser(id!),
    enabled: Boolean(id),
    staleTime: 30_000,
  });

  return {
    user: q.data ? parseStaffUserDetail(q.data) : null,
    raw: q.data,
    isLoading: q.isLoading,
    error: q.error,
    refetch: q.refetch,
  };
}
