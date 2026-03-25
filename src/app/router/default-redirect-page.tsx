/**
 * Redirect trang gốc (/) về trang làm việc chính theo role.
 * Chưa đăng nhập → /login; Đã đăng nhập → trang theo role.
 */
import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/app/store/hooks";
import { RoutePaths } from "@/app/router/route-paths";
import { getDefaultRedirectForRole } from "./default-redirect.rule";

export const DefaultRedirectPage = () => {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const initialized = useAppSelector((s) => s.auth.initialized);
  const roles = useAppSelector((s) => s.auth.user?.roles) as string[] | undefined;

  if (!initialized) return null;
  if (!isAuthenticated) return <Navigate to={RoutePaths.LOGIN} replace />;

  const target = getDefaultRedirectForRole(roles);
  return <Navigate to={target} replace />;
};
