import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/root-reducer';
import type { RoleCode } from '../../shared/types/auth.type';
import { RoutePaths } from './route-paths';

interface ProtectedRouteProps {
  requiredRoles?: RoleCode[];
  /** When set, overrides Redux `isAuthenticated` (e.g. layout wrapper). */
  isAuthenticated?: boolean;
  /** Khi false — chưa hydrate auth (GET /auth/me). */
  isInitialized?: boolean;
  children?: ReactNode;
}

export function ProtectedRoute({
  requiredRoles,
  isAuthenticated: isAuthenticatedProp,
  isInitialized = true,
  children,
}: ProtectedRouteProps) {
  const { isAuthenticated: reduxAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const isAuthenticated = isAuthenticatedProp ?? reduxAuthenticated;

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg text-sm text-gray-600">
        Đang tải…
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={RoutePaths.LOGIN} replace />;
  }

  if (requiredRoles && requiredRoles.length > 0) {
    if (!requiredRoles.includes(user.role)) {
      return <Navigate to={RoutePaths.FORBIDDEN} replace />;
    }
  }

  if (children !== undefined && children !== null) {
    return <>{children}</>;
  }

  return <Outlet />;
}

export default ProtectedRoute;
