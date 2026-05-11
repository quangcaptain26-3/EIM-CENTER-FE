import { useMemo } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { getUsers, type UsersListQuery } from '@/infrastructure/services/users.api';
import { QUERY_KEYS } from '@/infrastructure/query/query-keys';
import { parseUserListResponse } from '@/infrastructure/services/user-list.util';
import { ROLES } from '@/shared/constants/roles';
import type { RoleCode } from '@/shared/types/auth.type';

const ROLE_TABS = [ROLES.ADMIN, ROLES.ACADEMIC, ROLES.ACCOUNTANT, ROLES.TEACHER] as const;

export interface UserRoleTabCountParams {
  search?: string;
  /** `undefined` = tất cả trạng thái */
  isActive?: boolean;
}

/** Tổng toàn hệ thống + theo từng vai trò (GET /users limit=1) cho badge tab */
export function useUserRoleTabCounts(params: UserRoleTabCountParams) {
  const base: Pick<UsersListQuery, 'search' | 'isActive'> = {};
  if (params.search?.trim()) base.search = params.search.trim();
  if (params.isActive !== undefined) base.isActive = params.isActive;

  const allParams: UsersListQuery = { page: 1, limit: 1, ...base };
  const allQ = useQuery({
    queryKey: QUERY_KEYS.USERS.list(allParams),
    queryFn: () => getUsers(allParams),
    select: (data: unknown) => parseUserListResponse(data).total,
    staleTime: 30_000,
  });

  const queries = useQueries({
    queries: ROLE_TABS.map((role) => {
      const q: UsersListQuery = { page: 1, limit: 1, role, ...base };
      return {
        queryKey: QUERY_KEYS.USERS.list(q),
        queryFn: () => getUsers(q),
        select: (data: unknown) => parseUserListResponse(data).total,
        staleTime: 30_000,
      };
    }),
  });

  const byRole = useMemo(() => {
    const m: Record<RoleCode, number> = {
      ADMIN: 0,
      ACADEMIC: 0,
      ACCOUNTANT: 0,
      TEACHER: 0,
    };
    ROLE_TABS.forEach((role, i) => {
      m[role] = queries[i].data ?? 0;
    });
    return m;
  }, [queries]);

  return {
    totalAll: allQ.data ?? 0,
    byRole,
    isLoading: allQ.isLoading || queries.some((q) => q.isLoading),
  };
}
