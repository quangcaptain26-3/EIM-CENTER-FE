import { useCallback, useMemo } from 'react';
import { useAppSelector } from '@/app/store/hooks';
import {
  selectIsAuthenticated,
  selectPermissions,
  selectRole,
  selectUser,
} from '@/app/store/auth.selectors';
import { hasPermission } from '@/domain/auth/rules/auth.rule';
import type { RoleCode } from '@/shared/types/auth.type';

export function useAuth() {
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const role = useAppSelector(selectRole) as RoleCode | null;
  const permissions = useAppSelector(selectPermissions);

  const canDo = useCallback(
    (action: string) => {
      if (!permissions.length) return false;
      if (permissions.includes('*')) return true;
      return hasPermission(permissions, action);
    },
    [permissions],
  );

  return useMemo(
    () => ({
      user,
      role,
      isAuthenticated,
      canDo,
    }),
    [user, role, isAuthenticated, canDo],
  );
}
