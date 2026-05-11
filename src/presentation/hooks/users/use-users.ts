import { useQuery } from '@tanstack/react-query';
import { getUsers } from '@/infrastructure/services/users.api';
import type { UsersListQuery } from '@/infrastructure/services/users.api';
import { QUERY_KEYS } from '@/infrastructure/query/query-keys';
import { parseUserListResponse } from '@/infrastructure/services/user-list.util';
import type { RoleCode } from '@/shared/types/auth.type';
import type { UserStatus } from '@/shared/types/user.type';

export interface UsersListParams {
  page: number;
  limit: number;
  search?: string;
  role?: RoleCode | '';
  isActive?: boolean;
  /** @deprecated map sang `isActive` */
  status?: UserStatus | 'all';
}

const STALE_USERS_MS = 30_000;

export function useUsers(params: UsersListParams) {
  const apiParams: UsersListQuery = {
    page: params.page,
    limit: params.limit,
  };
  if (params.search?.trim()) apiParams.search = params.search.trim();
  if (params.role) apiParams.role = params.role;

  if (params.isActive !== undefined) {
    apiParams.isActive = params.isActive;
  } else if (params.status && params.status !== 'all') {
    apiParams.isActive = params.status === 'active';
  }

  const query = useQuery({
    queryKey: QUERY_KEYS.USERS.list(apiParams),
    queryFn: () => getUsers(apiParams),
    staleTime: STALE_USERS_MS,
  });

  const parsed = query.data ? parseUserListResponse(query.data) : { users: [], total: 0 };

  return {
    users: parsed.users,
    total: parsed.total,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
