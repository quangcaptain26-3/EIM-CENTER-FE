import { useMemo } from "react";
import { useAppSelector } from "@/app/store/hooks";
import { PERMISSIONS } from "@/domain/auth/models/permission.model";
import { hasPermission } from "@/domain/auth/rules/auth.rule";

/**
 * Hook tập trung quản lý phân quyền module Học viên trên UI.
 * Đồng bộ với backend: STUDENT_READ / STUDENT_WRITE
 */
export function useStudentsPermission() {
  const userPermissions = useAppSelector((state) => state.auth.user?.permissions);

  return useMemo(() => {
    const canRead = hasPermission(userPermissions, PERMISSIONS.STUDENT_READ);
    const canWrite = hasPermission(userPermissions, PERMISSIONS.STUDENT_WRITE);

    return {
      canRead,
      canWrite,
      hasWriteAccess: canWrite,
    };
  }, [userPermissions]);
}

