import { useMemo } from 'react';
import { useAuth } from '@/presentation/hooks/auth/use-auth';
import { ROLES } from '@/shared/constants/roles';
import type { RoleCode } from '@/shared/types/auth.type';

/**
 * RBAC nút nghiệp vụ (INT-A1) — map role → quyền hiển thị thao tác.
 * Điểm danh theo buổi: dùng thêm `canUserRecordAttendance` (attendance-access).
 */
export function usePermission() {
  const { role } = useAuth();

  return useMemo(() => {
    const r = role as RoleCode | null;

    return {
      role: r,
      /** Thay GV chính — ADMIN + Học vụ */
      canReplaceMainTeacher: r === ROLES.ADMIN || r === ROLES.ACADEMIC,
      /** Đổi lương GV — chỉ ADMIN */
      canChangeTeacherSalary: r === ROLES.ADMIN,
      /** Duyệt / từ chối bảo lưu — chỉ ADMIN */
      canApprovePauseRequest: r === ROLES.ADMIN,
      /** Tạo phiếu thu — ADMIN + ACCOUNTANT */
      canCreateReceipt: r === ROLES.ADMIN || r === ROLES.ACCOUNTANT,
      /** Chốt lương — ADMIN + ACCOUNTANT */
      canFinalizePayroll: r === ROLES.ADMIN || r === ROLES.ACCOUNTANT,
      /** Xem audit log — chỉ ADMIN */
      canViewAuditLog: r === ROLES.ADMIN,
      /** Xuất báo cáo học phí (GET /export/debt) — chỉ ADMIN+Kế toán; Học vụ xem danh sách, không export (OVERVIEW 3.2). */
      canExportDebtReport: r === ROLES.ADMIN || r === ROLES.ACCOUNTANT,
      /** Thêm học viên, Tạo lớp, thao tác ghi danh học thuật — ADMIN + ACADEMIC */
      canManageAcademicEnrollment: r === ROLES.ADMIN || r === ROLES.ACADEMIC,
      /** Q15: mở khóa makeup_blocked — chỉ ADMIN */
      canResetMakeupBlocked: r === ROLES.ADMIN,
    };
  }, [role]);
}
