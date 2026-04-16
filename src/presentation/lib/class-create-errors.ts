import { SHIFTS, WEEKDAY_LABELS } from '@/shared/constants/config';
import type { ApiError } from '@/shared/types/api.type';

export function getErrorCode(err: unknown): string | undefined {
  const e = err as Partial<ApiError>;
  return typeof e.code === 'string' ? e.code : undefined;
}

function formatCa(shift: number): string {
  const s = SHIFTS[shift as 1 | 2];
  if (!s) return `Ca ${shift}`;
  return `${s.label} (${s.time})`;
}

/** Hai ngày trong tuần đã chọn — "Thứ 2, Thứ 4" */
export function formatSchedulePairLabel(days: readonly [number, number]): string {
  const [a, b] = [...days].sort((x, y) => x - y) as [number, number];
  const la = WEEKDAY_LABELS[a];
  const lb = WEEKDAY_LABELS[b];
  if (!la || !lb) return days.join(', ');
  return `${la}, ${lb}`;
}

export function formatClassTeacherConflictMessage(
  teacherName: string,
  shift: number,
  scheduleDays: readonly [number, number],
): string {
  return `GV ${teacherName} đã có lớp vào ${formatCa(shift)} ${formatSchedulePairLabel(scheduleDays)} đó`;
}

export function formatClassRoomConflictMessage(
  roomCode: string,
  shift: number,
  scheduleDays: readonly [number, number],
): string {
  return `Phòng ${roomCode} đã được dùng vào ${formatCa(shift)} ${formatSchedulePairLabel(scheduleDays)} đó`;
}
