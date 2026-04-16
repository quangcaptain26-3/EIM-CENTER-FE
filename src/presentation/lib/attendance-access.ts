import { ROLES } from '@/shared/constants/roles';
import type { RoleCode } from '@/shared/types/auth.type';
import type { SessionDetailPayload } from '@/shared/types/session.type';
import { SESSION_STATUS } from '@/shared/constants/statuses';
import { formatDate, isTodayUtc7 } from '@/shared/lib/date';

export type AttendanceBlockReason = 'status' | 'day' | 'permission';

/**
 * Lý do không được điểm danh (để hiển thị banner/tooltip).
 * `null` = được phép điểm danh.
 */
export function getAttendanceBlockReason(
  role: RoleCode | null | undefined,
  userId: string | undefined,
  session: Pick<SessionDetailPayload, 'mainTeacherId' | 'coverTeacherId' | 'status' | 'scheduledDate'> | null | undefined,
): AttendanceBlockReason | null {
  if (!session || !session.scheduledDate) return 'day';
  if (session.status !== SESSION_STATUS.pending) return 'status';
  if (!isTodayUtc7(session.scheduledDate)) return 'day';
  if (!role) return 'permission';
  if (role === ROLES.ADMIN || role === ROLES.ACADEMIC) return null;
  if (
    role === ROLES.TEACHER &&
    userId &&
    (session.mainTeacherId === userId || session.coverTeacherId === userId)
  ) {
    return null;
  }
  return 'permission';
}

/** Ai được phép mở form điểm danh (theo role + GV hiệu lực) */
export function canUserRecordAttendance(
  role: RoleCode | null | undefined,
  userId: string | undefined,
  session: Pick<SessionDetailPayload, 'mainTeacherId' | 'coverTeacherId' | 'status' | 'scheduledDate'>,
): boolean {
  return getAttendanceBlockReason(role, userId, session) === null;
}

/** @deprecated Dùng attendanceDayBlockedTooltip(sessionDate) để hiển thị đúng ngày buổi học */
export const ATTENDANCE_DAY_TOOLTIP = 'Chỉ điểm danh được trong ngày học';

export const ATTENDANCE_PERMISSION_TOOLTIP = 'Bạn không có quyền điểm danh buổi học này';

/** Tooltip khi sessionDate !== hôm nay (UTC+7) — khớp rule nghiệp vụ */
export function attendanceDayBlockedTooltip(sessionDateIso: string | undefined | null): string {
  if (!sessionDateIso) return ATTENDANCE_DAY_TOOLTIP;
  return `Chỉ có thể điểm danh vào ngày ${formatDate(sessionDateIso)}`;
}
