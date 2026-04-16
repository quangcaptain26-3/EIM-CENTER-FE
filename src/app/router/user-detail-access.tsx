import { Navigate, useParams } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAppSelector } from '@/app/store/hooks';
import { RoutePaths } from '@/app/router/route-paths';
import { ROLES } from '@/shared/constants/roles';

/** ADMIN xem mọi user; user khác chỉ xem hồ sơ của chính mình (`id` === auth user id). */
export function UserDetailAccess({ children }: { children: ReactNode }) {
  const { id } = useParams<{ id: string }>();
  const user = useAppSelector((s) => s.auth.user);

  if (!user || !id) return <Navigate to={RoutePaths.LOGIN} replace />;

  if (user.role === ROLES.ADMIN || user.id === id) {
    return <>{children}</>;
  }

  return <Navigate to={RoutePaths.FORBIDDEN} replace />;
}
