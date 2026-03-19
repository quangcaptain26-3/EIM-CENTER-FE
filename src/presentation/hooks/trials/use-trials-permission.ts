import { useMemo } from "react";
import { useAppSelector } from "@/app/store/hooks";
import { PERMISSIONS } from "@/domain/auth/models/permission.model";
import { hasPermission } from "@/domain/auth/rules/auth.rule";

/**
 * Hook tập trung quản lý phân quyền module Trials trên UI.
 * Đồng bộ với backend: TRIALS_READ / TRIALS_WRITE
 */
export function useTrialsPermission() {
  const userPermissions = useAppSelector((state) => state.auth.user?.permissions);

  return useMemo(() => {
    const canRead = hasPermission(userPermissions, PERMISSIONS.TRIALS_READ);
    const canWrite = hasPermission(userPermissions, PERMISSIONS.TRIALS_WRITE);

    return {
      canRead,
      canWrite,
      hasWriteAccess: canWrite, // alias cho tính nhất quán
    };
  }, [userPermissions]);
}

