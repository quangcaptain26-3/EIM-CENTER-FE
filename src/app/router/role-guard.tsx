// role-guard.tsx
// Component kiểm tra quyền theo role trước khi render nội dung.
// Nếu user không có role hợp lệ → redirect về trang Forbidden.

import { Navigate } from "react-router-dom";
import { RoutePaths } from "@/app/router/route-paths";
import { useAppSelector } from "@/app/store/hooks";
import type { ReactNode } from "react";
import { hasPermission } from "@/domain/auth/rules/auth.rule";

interface RoleGuardProps {
  // Danh sách role được phép truy cập route này
  allowedRoles: string[];
  // (Tuỳ chọn) Danh sách permission được phép truy cập route này (canonical theo BE)
  allowedPermissions?: string[];
  // Danh sách role hiện tại của user (tùy chọn, nếu không có sẽ lấy từ Redux store)
  userRoles?: string[];
  // Trang redirect khi không đủ quyền (mặc định /forbidden)
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
  // Lấy roles từ Redux store nếu không được truyền qua props
  const authRoles = useAppSelector((s) => s.auth.user?.roles) as
    | string[]
    | undefined;
  const authPermissions = useAppSelector((s) => s.auth.user?.permissions) as
    | string[]
    | undefined;
  const userRoles = userRolesProp || authRoles || [];

  const hasRoleAccess =
    allowedRoles.length === 0 || userRoles.some((role) => allowedRoles.includes(role));

  const hasPermissionAccess =
    !allowedPermissions ||
    allowedPermissions.length === 0 ||
    allowedPermissions.some((p) => hasPermission(authPermissions, p));

  // Không đủ quyền → chuyển về trang forbidden
  if (!hasRoleAccess || !hasPermissionAccess) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Đủ quyền → render nội dung
  return <>{children}</>;
};

export default RoleGuard;
