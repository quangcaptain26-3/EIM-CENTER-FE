// role-guard.tsx
// Kiểm tra quyền theo role (và tuỳ chọn permission) trước khi render nội dung.

import { Navigate } from 'react-router-dom';
import { RoutePaths } from '@/app/router/route-paths';
import { useAppSelector } from '@/app/store/hooks';
import type { ReactNode } from 'react';
import { hasPermission } from '@/domain/auth/rules/auth.rule';

interface RoleGuardProps {
  allowedRoles: string[];
  allowedPermissions?: string[];
  userRoles?: string[];
  fallbackPath?: string;
  children: ReactNode;
}

const RoleGuard = ({
  allowedRoles,
  allowedPermissions,
  userRoles: userRolesProp,
  fallbackPath = RoutePaths.FORBIDDEN,
  children,
}: RoleGuardProps) => {
  const authUser = useAppSelector((s) => s.auth.user);
  const authPermissions = useAppSelector((s) => s.auth.user?.permissions) as string[] | undefined;

  const userRoles =
    userRolesProp ?? (authUser?.role ? [authUser.role] : []);

  const hasRoleAccess =
    allowedRoles.length === 0 || userRoles.some((role) => allowedRoles.includes(role));

  const hasPermissionAccess =
    !allowedPermissions ||
    allowedPermissions.length === 0 ||
    allowedPermissions.some((p) => hasPermission(authPermissions, p));

  if (!hasRoleAccess || !hasPermissionAccess) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;
