import type { ApiResponse, PagedResult } from '@/shared/types/api.type';
import type {
  ClassDetail,
  ClassListItem,
  ProgramOption,
  RoomOption,
  RosterRow,
} from '@/shared/types/class.type';
import { scheduleDays } from '@/shared/lib/date';

function unwrapBody(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object') return raw;
  const r = raw as ApiResponse<unknown>;
  return r.data !== undefined ? r.data : raw;
}

function enrichClassListItem(row: ClassListItem): ClassListItem {
  const r = row as ClassListItem & {
    schedule_days?: number[];
    scheduleDays?: number[];
    shift?: number | string;
    currentTeacher?: { fullName?: string; full_name?: string };
  };
  const days = r.scheduleDays ?? r.schedule_days;
  const label = r.scheduleLabel?.trim();
  let out: ClassListItem = { ...row };

  if (!label && Array.isArray(days) && days.length > 0) {
    out = { ...out, scheduleLabel: scheduleDays(days) };
  }

  const sn = typeof r.shift === 'number' ? r.shift : r.shift === 'SHIFT_1' ? 1 : r.shift === 'SHIFT_2' ? 2 : undefined;
  if (sn === 1 || sn === 2) {
    if (!out.shiftLabel) {
      out = { ...out, shiftLabel: sn === 1 ? 'Ca 1' : 'Ca 2' };
    }
    if (!out.shift) {
      out = { ...out, shift: sn === 1 ? 'SHIFT_1' : 'SHIFT_2' };
    }
  }

  const ct = r.currentTeacher;
  if (!out.mainTeacherName?.trim() && ct) {
    const name = ct.fullName ?? ct.full_name;
    if (name) out = { ...out, mainTeacherName: String(name) };
  }

  return out;
}

export function parseClassListResponse(raw: unknown): { items: ClassListItem[]; total: number } {
  const inner = unwrapBody(raw);
  if (Array.isArray(inner)) {
    const items = (inner as ClassListItem[]).map(enrichClassListItem);
    return { items, total: items.length };
  }
  if (inner && typeof inner === 'object' && 'data' in inner) {
    const p = inner as PagedResult<ClassListItem>;
    if (Array.isArray(p.data)) {
      const items = p.data.map(enrichClassListItem);
      return { items, total: p.total ?? items.length };
    }
  }
  if (inner && typeof inner === 'object' && 'items' in inner) {
    const row = inner as { items?: ClassListItem[]; total?: number };
    const items = (row.items ?? []).map(enrichClassListItem);
    return { items, total: row.total ?? items.length };
  }
  return { items: [], total: 0 };
}

export function parseClassDetail(raw: unknown): ClassDetail | null {
  const inner = unwrapBody(raw);
  if (!inner || typeof inner !== 'object') return null;
  const o = inner as Record<string, unknown>;
  const ci = o.classInfo && typeof o.classInfo === 'object' ? (o.classInfo as Record<string, unknown>) : null;
  const base: Record<string, unknown> = ci
    ? { ...ci, staffHistory: o.staffHistory ?? ci.staffHistory, sessionsCount: o.sessionsCount }
    : { ...o };
  const days = (base.scheduleDays ?? base.schedule_days) as number[] | undefined;
  const label = (base.scheduleLabel ?? base.schedule_label) as string | undefined;
  const scheduleLabel =
    (label && String(label).trim()) || (Array.isArray(days) && days.length > 0 ? scheduleDays(days) : undefined);
  return { ...(base as unknown as ClassDetail), scheduleLabel };
}

function normalizeRosterRow(row: Record<string, unknown>): RosterRow {
  const unexcused = row.unexcusedAbsenceCount ?? row.unexcused_absence_count;
  return {
    enrollmentId: String(row.enrollmentId ?? row.enrollment_id ?? ''),
    studentId: String(row.studentId ?? row.student_id ?? ''),
    studentName: String(row.studentName ?? row.full_name ?? row.student_name ?? ''),
    studentCode:
      row.studentCode != null
        ? String(row.studentCode)
        : row.student_code != null
          ? String(row.student_code)
          : undefined,
    status: String(row.status ?? ''),
    type: row.type as RosterRow['type'],
    sessionsCompleted:
      row.sessionsCompleted != null
        ? Number(row.sessionsCompleted)
        : row.sessions_completed != null
          ? Number(row.sessions_completed)
          : undefined,
    sessionsTotal:
      row.sessionsTotal != null
        ? Number(row.sessionsTotal)
        : row.sessions_total != null
          ? Number(row.sessions_total)
          : undefined,
    debtAmount: (() => {
      const raw = row.debtAmount ?? row.debt_amount;
      if (raw == null || raw === '') return null;
      const n = Number(raw);
      return Number.isFinite(n) ? n : null;
    })(),
    unexcusedAbsenceCount:
      unexcused != null && unexcused !== '' ? Number(unexcused) : undefined,
  };
}

export function parseRosterResponse(raw: unknown): RosterRow[] {
  const inner = unwrapBody(raw);
  let rows: unknown[] = [];
  if (Array.isArray(inner)) rows = inner;
  else if (inner && typeof inner === 'object' && Array.isArray((inner as { data?: unknown }).data)) {
    rows = (inner as { data: unknown[] }).data;
  }
  return rows.map((r) => normalizeRosterRow(r as Record<string, unknown>));
}

export function parseProgramsResponse(raw: unknown): ProgramOption[] {
  const inner = unwrapBody(raw);
  if (Array.isArray(inner)) return inner as ProgramOption[];
  if (inner && typeof inner === 'object' && Array.isArray((inner as { data?: unknown }).data)) {
    return (inner as { data: ProgramOption[] }).data;
  }
  return [];
}

/** id entity vừa tạo (class, …) */
export function parseCreatedId(raw: unknown): string | null {
  const inner = unwrapBody(raw);
  if (!inner || typeof inner !== 'object') return null;
  const o = inner as Record<string, unknown>;
  if (o.id != null) return String(o.id);
  if (o.data && typeof o.data === 'object' && (o.data as { id?: unknown }).id != null) {
    return String((o.data as { id: unknown }).id);
  }
  return null;
}

export function parseRoomsResponse(raw: unknown): RoomOption[] {
  const inner = unwrapBody(raw);
  if (Array.isArray(inner)) return inner as RoomOption[];
  if (inner && typeof inner === 'object' && Array.isArray((inner as { data?: unknown }).data)) {
    return (inner as { data: RoomOption[] }).data;
  }
  return [];
}
