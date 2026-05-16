import type { ApiResponse, PagedResult } from '@/shared/types/api.type';
import type {
  AttendanceHistoryRow,
  EnrollmentCardModel,
  MakeupSessionRow,
  PauseRequestRow,
  StudentDetail,
  StudentListItem,
  StudentSearchSuggestion,
} from '@/shared/types/student.type';

function unwrapBody(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object') return raw;
  const r = raw as ApiResponse<unknown>;
  return r.data !== undefined ? r.data : raw;
}

export function parseStudentListResponse(raw: unknown): { items: StudentListItem[]; total: number } {
  const inner = unwrapBody(raw);
  if (Array.isArray(inner)) return { items: inner as StudentListItem[], total: inner.length };
  if (inner && typeof inner === 'object' && 'data' in inner) {
    const p = inner as PagedResult<StudentListItem>;
    if (Array.isArray(p.data)) return { items: p.data, total: p.total ?? p.data.length };
  }
  if (inner && typeof inner === 'object' && 'items' in inner) {
    const row = inner as { items?: StudentListItem[]; total?: number };
    const items = row.items ?? [];
    return { items, total: row.total ?? items.length };
  }
  return { items: [], total: 0 };
}

export function parseStudentDetail(raw: unknown): StudentDetail | null {
  const inner = unwrapBody(raw);
  if (!inner || typeof inner !== 'object') return null;
  const o = inner as Record<string, unknown>;
  const base = inner as StudentDetail;
  const dob = o.dob ?? o.dateOfBirth ?? o.date_of_birth;
  return {
    ...base,
    dateOfBirth:
      dob != null ? String(dob) : base.dateOfBirth != null ? String(base.dateOfBirth) : null,
    createdAt:
      o.createdAt != null
        ? String(o.createdAt)
        : o.created_at != null
          ? String(o.created_at)
          : base.createdAt,
    createdBy:
      o.createdBy != null
        ? String(o.createdBy)
        : o.created_by != null
          ? String(o.created_by)
          : base.createdBy,
    createdByName:
      o.createdByName != null
        ? String(o.createdByName)
        : o.created_by_name != null
          ? String(o.created_by_name)
          : base.createdByName,
  };
}

function normalizeStudentSearchRow(r: Record<string, unknown>): StudentSearchSuggestion {
  const ae = r.activeEnrollment as Record<string, unknown> | undefined;
  const programCode = ae ? String(ae.programCode ?? ae.program_code ?? '') : '';
  const classCode = ae ? String(ae.classCode ?? ae.class_code ?? '') : '';
  return {
    id: String(r.id),
    studentCode: String(r.studentCode ?? r.student_code ?? ''),
    fullName: String(r.fullName ?? r.full_name ?? ''),
    parentPhone:
      r.parentPhone != null
        ? String(r.parentPhone)
        : r.parent_phone != null
          ? String(r.parent_phone)
          : null,
    label: r.label != null ? String(r.label) : undefined,
    status: r.status != null ? String(r.status) : null,
    enrollmentStatus: ae ? String(ae.status ?? '') : (r.enrollmentStatus != null ? String(r.enrollmentStatus) : null),
    currentLevelLabel: programCode || null,
    activeClassCode: classCode || null,
  };
}

export function parseStudentSearchSuggestions(raw: unknown): StudentSearchSuggestion[] {
  const inner = unwrapBody(raw);
  let arr: unknown[] = [];
  if (Array.isArray(inner)) arr = inner;
  else if (inner && typeof inner === 'object' && Array.isArray((inner as { data?: unknown }).data)) {
    arr = (inner as { data: unknown[] }).data;
  } else if (inner && typeof inner === 'object' && Array.isArray((inner as { suggestions?: unknown }).suggestions)) {
    arr = (inner as { suggestions: unknown[] }).suggestions;
  }
  return arr.map((item) => normalizeStudentSearchRow(item as Record<string, unknown>));
}

/** GET /search/students — có thể trả { students, byPhone } hoặc mảng phẳng */
export function parseStudentSearchBundle(raw: unknown): {
  students: StudentSearchSuggestion[];
  byPhone: StudentSearchSuggestion[];
} {
  const inner = unwrapBody(raw);
  if (inner && typeof inner === 'object') {
    const o = inner as Record<string, unknown>;
    if ('students' in o || 'byPhone' in o) {
      const students = Array.isArray(o.students)
        ? (o.students as unknown[]).map((item) => normalizeStudentSearchRow(item as Record<string, unknown>))
        : parseStudentSearchSuggestions(inner);
      const byPhone = Array.isArray(o.byPhone)
        ? (o.byPhone as unknown[]).map((item) => normalizeStudentSearchRow(item as Record<string, unknown>))
        : [];
      return { students, byPhone };
    }
  }
  const flat = parseStudentSearchSuggestions(raw);
  return { students: flat.slice(0, 5), byPhone: [] };
}

function normalizeEnrollmentRow(r: Record<string, unknown>): EnrollmentCardModel {
  const tuition =
    r.tuitionFee != null
      ? Number(r.tuitionFee)
      : r.tuition_fee != null
        ? Number(r.tuition_fee)
        : undefined;
  const rawId = r.id ?? r.enrollmentId ?? r.enrollment_id;
  return {
    id: rawId != null && String(rawId) !== 'undefined' ? String(rawId) : '',
    programId: r.programId != null ? String(r.programId) : r.program_id != null ? String(r.program_id) : undefined,
    programCode:
      r.programCode != null
        ? String(r.programCode)
        : r.program_code != null
          ? String(r.program_code)
          : undefined,
    programName:
      r.programName != null
        ? String(r.programName)
        : r.program_name != null
          ? String(r.program_name)
          : undefined,
    classId: r.classId != null ? String(r.classId) : r.class_id != null ? String(r.class_id) : undefined,
    className: r.className != null ? String(r.className) : r.class_name != null ? String(r.class_name) : undefined,
    classCode:
      r.classCode != null
        ? String(r.classCode)
        : r.class_code != null
          ? String(r.class_code)
          : undefined,
    status: String(r.status ?? ''),
    sessionsCompleted: r.sessionsCompleted != null ? Number(r.sessionsCompleted) : undefined,
    sessionsTotal: r.sessionsTotal != null ? Number(r.sessionsTotal) : undefined,
    sessionsAttended: r.sessionsAttended != null ? Number(r.sessionsAttended) : undefined,
    transferCount: r.transferCount != null ? Number(r.transferCount) : undefined,
    classTransferCount: r.classTransferCount != null ? Number(r.classTransferCount) : undefined,
    transferBlocked: r.transferBlocked != null ? Boolean(r.transferBlocked) : undefined,
    makeupBlocked: r.makeupBlocked != null ? Boolean(r.makeupBlocked) : undefined,
    unexcusedAbsences: r.unexcusedAbsences != null ? Number(r.unexcusedAbsences) : undefined,
    pendingPauseRequest: r.pendingPauseRequest != null ? Boolean(r.pendingPauseRequest) : undefined,
    tuitionAmount: tuition,
    /** Snapshot học phí lúc ghi danh (cùng nguồn tuitionFee BE) */
    tuitionFee: tuition,
    amountPaid: r.amountPaid != null ? Number(r.amountPaid) : r.amount_paid != null ? Number(r.amount_paid) : undefined,
    debtAmount: r.debt != null ? Number(r.debt) : r.debtAmount != null ? Number(r.debtAmount) : undefined,
    endedAt: r.endedAt != null ? String(r.endedAt) : r.ended_at != null ? String(r.ended_at) : null,
  };
}

export function parseEnrollmentsList(raw: unknown): EnrollmentCardModel[] {
  const inner = unwrapBody(raw);
  let arr: unknown[] = [];
  if (Array.isArray(inner)) arr = inner;
  else if (inner && typeof inner === 'object' && Array.isArray((inner as { data?: unknown }).data)) {
    arr = (inner as { data: unknown[] }).data;
  }
  return arr.map((row) => normalizeEnrollmentRow(row as Record<string, unknown>));
}

function normalizeAttendanceHistoryRow(r: Record<string, unknown>): AttendanceHistoryRow {
  return {
    id: String(r.id ?? ''),
    sessionNo:
      r.sessionNo != null
        ? Number(r.sessionNo)
        : r.session_no != null
          ? Number(r.session_no)
          : null,
    sessionDate:
      r.sessionDate != null
        ? String(r.sessionDate)
        : r.session_date != null
          ? String(r.session_date)
          : undefined,
    status: r.status != null ? String(r.status) : undefined,
    note: r.note != null ? String(r.note) : null,
    className:
      r.className != null
        ? String(r.className)
        : r.class_name != null
          ? String(r.class_name)
          : undefined,
    shift: r.shift != null ? Number(r.shift) : null,
    shiftLabel:
      r.shiftLabel != null
        ? String(r.shiftLabel)
        : r.shift_label != null
          ? String(r.shift_label)
          : null,
    timeRange:
      r.timeRange != null
        ? String(r.timeRange)
        : r.time_range != null
          ? String(r.time_range)
          : null,
  };
}

export function parseAttendanceHistory(raw: unknown): AttendanceHistoryRow[] {
  const inner = unwrapBody(raw);
  let arr: unknown[] = [];
  if (Array.isArray(inner)) arr = inner;
  else if (inner && typeof inner === 'object' && Array.isArray((inner as { data?: unknown }).data)) {
    arr = (inner as { data: unknown[] }).data;
  }
  return arr.map((item) => normalizeAttendanceHistoryRow(item as Record<string, unknown>));
}

function normalizeMakeupSessionRow(r: Record<string, unknown>): MakeupSessionRow {
  const code = String(r.code ?? r.makeupCode ?? r.makeup_code ?? '');
  const scheduled =
    r.scheduledDate ?? r.makeupDate ?? r.makeup_date ?? r.scheduled_date;
  return {
    id: String(r.id),
    code: code || undefined,
    studentId: r.studentId != null ? String(r.studentId) : r.student_id != null ? String(r.student_id) : undefined,
    studentName:
      r.studentName != null
        ? String(r.studentName)
        : r.student_name != null
          ? String(r.student_name)
          : undefined,
    studentCode:
      r.studentCode != null
        ? String(r.studentCode)
        : r.student_code != null
          ? String(r.student_code)
          : undefined,
    enrollmentId:
      r.enrollmentId != null
        ? String(r.enrollmentId)
        : r.enrollment_id != null
          ? String(r.enrollment_id)
          : undefined,
    originalSessionNo:
      r.originalSessionNo != null
        ? Number(r.originalSessionNo)
        : r.original_session_no != null
          ? Number(r.original_session_no)
          : null,
    originalDate:
      r.originalDate != null
        ? String(r.originalDate).slice(0, 10)
        : r.original_date != null
          ? String(r.original_date).slice(0, 10)
          : null,
    scheduledDate: scheduled != null ? String(scheduled).slice(0, 10) : undefined,
    status: String(r.status ?? 'pending'),
    roomId: r.roomId != null ? String(r.roomId) : r.room_id != null ? String(r.room_id) : undefined,
    roomName:
      r.roomName != null
        ? String(r.roomName)
        : r.room_name != null
          ? String(r.room_name)
          : undefined,
    teacherId:
      r.teacherId != null ? String(r.teacherId) : r.teacher_id != null ? String(r.teacher_id) : undefined,
    teacherName:
      r.teacherName != null
        ? String(r.teacherName)
        : r.teacher_name != null
          ? String(r.teacher_name)
          : undefined,
  };
}

export function parseMakeupSessionsList(raw: unknown): MakeupSessionRow[] {
  const inner = unwrapBody(raw);
  const rows: unknown[] = Array.isArray(inner)
    ? inner
    : inner && typeof inner === 'object' && Array.isArray((inner as { data?: unknown }).data)
      ? (inner as { data: unknown[] }).data
      : [];
  return rows.map((item) =>
    normalizeMakeupSessionRow(item && typeof item === 'object' ? (item as Record<string, unknown>) : {}),
  );
}

export function parsePauseRequestsList(raw: unknown): PauseRequestRow[] {
  const inner = unwrapBody(raw);
  if (Array.isArray(inner)) return inner as PauseRequestRow[];
  if (inner && typeof inner === 'object' && Array.isArray((inner as { data?: unknown }).data)) {
    return (inner as { data: PauseRequestRow[] }).data;
  }
  return [];
}
