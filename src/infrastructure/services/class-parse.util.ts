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
    class_id?: string;
    program_id?: string;
    schedule_days?: number[];
    scheduleDays?: number[];
    shift?: number | string;
    currentTeacher?: { fullName?: string; full_name?: string };
  };
  const days = r.scheduleDays ?? r.schedule_days;
  const label = r.scheduleLabel?.trim();
  const id = String(row.id ?? r.class_id ?? '').trim();
  const programIdRaw = row.programId ?? r.program_id;
  let out: ClassListItem = {
    ...row,
    id,
    programId: programIdRaw != null && String(programIdRaw).trim() !== '' ? String(programIdRaw) : row.programId,
  };

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
  const merged = { ...(base as unknown as ClassDetail), scheduleLabel };
  const enriched = enrichClassListItem(merged);
  const rc = enriched.roomCode?.trim();
  const rn = enriched.roomName?.trim();
  const id = String(base.id ?? base.class_id ?? enriched.id ?? '').trim();
  const programIdRaw = base.programId ?? base.program_id ?? enriched.programId;
  return {
    ...enriched,
    id,
    programId:
      programIdRaw != null && String(programIdRaw).trim() !== ''
        ? String(programIdRaw)
        : enriched.programId,
    roomName: rn || rc || undefined,
  };
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
          : row.sessionsAttended != null
            ? Number(row.sessionsAttended)
            : row.sessions_attended != null
              ? Number(row.sessions_attended)
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

function normalizeProgramRow(row: Record<string, unknown>): ProgramOption {
  const df = row.defaultFee ?? row.default_fee;
  const defaultFee =
    typeof df === 'number' && Number.isFinite(df) ? df : df != null && String(df).length > 0 ? Number(df) : undefined;
  const ts = row.totalSessions ?? row.total_sessions;
  const totalSessions =
    typeof ts === 'number' && Number.isFinite(ts) ? ts : ts != null ? Number(ts) || 24 : undefined;
  const lo = row.levelOrder ?? row.level_order;
  const levelOrder = typeof lo === 'number' && Number.isFinite(lo) ? lo : lo != null ? Number(lo) : undefined;
  const rawActive = row.isActive ?? row.is_active;
  const isActive = rawActive === undefined || rawActive === null ? true : Boolean(rawActive);

  return {
    id: String(row.id ?? ''),
    name: String(row.name ?? ''),
    code: row.code as ProgramOption['code'],
    defaultFee,
    totalSessions,
    levelOrder,
    isActive,
    feeLabel: defaultFee != null ? undefined : row.feeLabel as string | undefined,
    feePerSession: row.feePerSession as number | undefined,
  };
}

export function parseProgramsResponse(raw: unknown): ProgramOption[] {
  const inner = unwrapBody(raw);
  let rows: unknown[] = [];
  if (Array.isArray(inner)) rows = inner;
  else if (inner && typeof inner === 'object' && Array.isArray((inner as { data?: unknown }).data)) {
    rows = (inner as { data: unknown[] }).data;
  }
  return rows.map((r) => normalizeProgramRow(r as Record<string, unknown>));
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
  const rows: unknown[] = Array.isArray(inner)
    ? inner
    : inner && typeof inner === 'object' && Array.isArray((inner as { data?: unknown }).data)
      ? (inner as { data: unknown[] }).data
      : [];

  return rows
    .map((row) => {
      if (!row || typeof row !== 'object') return null;
      const r = row as Record<string, unknown>;
      const id = r.id != null ? String(r.id) : '';
      const roomCode = String(r.roomCode ?? r.room_code ?? r.code ?? '').trim();
      if (!id) return null;
      return {
        id,
        name: String(r.name ?? (roomCode || id)),
        code: roomCode || undefined,
        roomCode: roomCode || undefined,
        capacity: r.capacity != null ? Number(r.capacity) : undefined,
      } satisfies RoomOption;
    })
    .filter((r): r is RoomOption => r != null);
}
