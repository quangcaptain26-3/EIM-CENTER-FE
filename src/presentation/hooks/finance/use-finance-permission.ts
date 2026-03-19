import { useAppSelector } from "@/app/store/hooks";
import { PERMISSIONS } from "@/domain/auth/models/permission.model";
import { hasPermission } from "@/domain/auth/rules/auth.rule";
import { useMemo } from "react";

/**
 * Hook tập trung quản lý phân quyền module Tài chính trên UI.
 */
export function useFinancePermission() {
  const userPermissions = useAppSelector((state) => state.auth.user?.permissions);

  const permissions = useMemo(() => ({
    canRead: hasPermission(userPermissions, PERMISSIONS.FINANCE_READ),
    canWrite: hasPermission(userPermissions, PERMISSIONS.FINANCE_WRITE),
    hasWriteAccess: hasPermission(userPermissions, PERMISSIONS.FINANCE_WRITE), // Alias cho tính nhất quán
  }), [userPermissions]);

  return permissions;
}
