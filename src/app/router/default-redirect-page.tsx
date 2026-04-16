/**
 * Redirect trang gốc (/) về trang làm việc chính theo role.
 * Chưa đăng nhập → /login; Đã đăng nhập → trang theo role.
 */
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/app/store/hooks';
import { selectIsAuthenticated, selectIsInitialized, selectUser } from '@/app/store/auth.selectors';
import { RoutePaths } from '@/app/router/route-paths';
import { getDefaultRedirectForRole } from './default-redirect.rule';

export const DefaultRedirectPage = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isInitialized = useAppSelector(selectIsInitialized);
  const user = useAppSelector(selectUser);
  const roles = user?.role ? [user.role] : [];

  if (!isInitialized) return null;
  if (!isAuthenticated) return <Navigate to={RoutePaths.LOGIN} replace />;

  const target = getDefaultRedirectForRole(roles);
  return <Navigate to={target} replace />;
};
