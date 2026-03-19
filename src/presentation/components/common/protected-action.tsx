// protected-action.tsx
// Ẩn/Hiện một component (như Nút "Xóa", Nút "Duyệt học phí") dựa vào Role/Permission của user hiện tại.

import type { ReactNode } from "react";
import { useAppSelector } from "../../../app/store/hooks";
import { hasPermission } from "../../../domain/auth/rules/auth.rule";

export interface ProtectedActionProps {
  allowedRoles?: string[]; // VD: ['ROOT', 'DIRECTOR']
  allowedPermissions?: string[]; // VD: ['FINANCE_WRITE']
  userRoles?: string[]; // (Optional) Override Redux auth state if needed
  children: ReactNode; // Cái nút thật sự
  fallback?: ReactNode; // Component thay thế (VD: Nút xám mờ)
}

export const ProtectedAction = ({
  allowedRoles,
  allowedPermissions,
  userRoles,
  children,
  fallback = null,
}: ProtectedActionProps) => {
  // Lấy roles từ Redux state nếu không truyền vào
  const currentUserRoles = useAppSelector(
    (state) => state.auth.user?.roles || [],
  );
  const currentUserPermissions = useAppSelector(
    (state) => state.auth.user?.permissions,
  );
  const activeRoles = userRoles || currentUserRoles;

  // Không giới hạn -> Render
  const roleUnrestricted = !allowedRoles || allowedRoles.length === 0;
  const permissionUnrestricted = !allowedPermissions || allowedPermissions.length === 0;
  if (roleUnrestricted && permissionUnrestricted) {
    return <>{children}</>;
  }

  const hasRoleAccess =
    roleUnrestricted ||
    (activeRoles.length > 0 && allowedRoles.some((r) => activeRoles.includes(r)));

  const hasPermissionAccess =
    permissionUnrestricted ||
    allowedPermissions.some((p) => hasPermission(currentUserPermissions, p));

  if (hasRoleAccess && hasPermissionAccess) return <>{children}</>;

  // Rớt filter -> Fallback
  return <>{fallback}</>;
};
