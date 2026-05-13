import type { ApiResponse } from '@/shared/types/api.type';
import type {
  AvailableCoverTeacher,
  ClassSessionRow,
  MySessionRow,
  SessionAttendanceRow,
  SessionDetailPayload,
} from '@/shared/types/session.type';

function unwrapBody(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object') return raw;
  const r = raw as ApiResponse<unknown>;
  return r.data !== undefined ? r.data : raw;
}

export function parseClassSessionsResponse(raw: unknown): ClassSessionRow[] {
  const inner = unwrapBody(raw);
  if (Array.isArray(inner)) return inner as ClassSessionRow[];
  if (inner && typeof inner === 'object' && Array.isArray((inner as { data?: unknown }).data)) {
    return (inner as { data: ClassSessionRow[] }).data;
  }
  if (inner && typeof inner === 'object' && Array.isArray((inner as { sessions?: unknown }).sessions)) {
    return (inner as { sessions: ClassSessionRow[] }).sessions;
  }
  return [];
}

function normalizeMySessionRow(r: Record<string, unknown>): MySessionRow {
  const coverName = r.coverTeacherName ?? r.cover_teacher_name;
  return {
    id: String(r.id),
    scheduledDate: String(r.scheduledDate ?? r.scheduled_date ?? ''),
    classId: String(r.classId ?? r.class_id ?? ''),
    classCode: r.classCode != null ? String(r.classCode) : r.class_code != null ? String(r.class_code) : undefined,
    className: r.className != null ? String(r.className) : r.class_name != null ? String(r.class_name) : undefined,
    shiftLabel: r.shiftLabel != null ? String(r.shiftLabel) : r.shift_label != null ? String(r.shift_label) : undefined,
    roleType: r.roleType === 'cover' || r.role_type === 'cover' ? 'cover' : 'main',
    status: String(r.status ?? ''),
    submittedAt:
      r.submittedAt != null
        ? String(r.submittedAt)
        : r.submitted_at != null
          ? String(r.submitted_at)
          : null,
    coverTeacherName:
      coverName === null || coverName === undefined ? null : coverName === '' ? null : String(coverName),
  };
}

export function parseMySessionsResponse(raw: unknown): MySessionRow[] {
  const inner = unwrapBody(raw);
  let arr: unknown[] = [];
  if (Array.isArray(inner)) arr = inner;
  else if (inner && typeof inner === 'object' && Array.isArray((inner as { data?: unknown }).data)) {
    arr = (inner as { data: unknown[] }).data;
  } else if (inner && typeof inner === 'object' && Array.isArray((inner as { sessions?: unknown }).sessions)) {
    arr = (inner as { sessions: unknown[] }).sessions;
  }
  return arr.map((row) => normalizeMySessionRow(row as Record<string, unknown>));
}

export function parseMySessionsBundle(raw: unknown): {
  sessions: MySessionRow[];
  summary?: Record<string, number>;
} {
  const inner = unwrapBody(raw);
  if (inner && typeof inner === 'object' && Array.isArray((inner as { sessions?: unknown }).sessions)) {
    const o = inner as { sessions: unknown[]; summary?: Record<string, number> };
    return {
      sessions: o.sessions.map((row) => normalizeMySessionRow(row as Record<string, unknown>)),
      summary: o.summary,
    };
  }
  return { sessions: parseMySessionsResponse(raw), summary: undefined };
}

export function parseAvailableCovers(raw: unknown): AvailableCoverTeacher[] {
  const inner = unwrapBody(raw);
  let arr: unknown[] = [];
  if (Array.isArray(inner)) arr = inner;
  else if (inner && typeof inner === 'object' && Array.isArray((inner as { data?: unknown }).data)) {
    arr = (inner as { data: unknown[] }).data;
  } else if (inner && typeof inner === 'object' && Array.isArray((inner as { teachers?: unknown }).teachers)) {
    arr = (inner as { teachers: unknown[] }).teachers;
  } else {
    return [];
  }

  return arr.map((item) => {
    const o = item as Record<string, unknown>;
    const userId = String(o.userId ?? o.user_id ?? '');
    const fullName = String(o.fullName ?? o.full_name ?? '');
    const isAvailable =
      o.isAvailable !== undefined && o.isAvailable !== null
        ? Boolean(o.isAvailable)
        : o.is_available !== undefined
          ? Boolean(o.is_available)
          : !(o.isConflict ?? o.is_conflict);
    const conflictRaw = o.conflictReason ?? o.conflict_reason;
    const conflictReason =
      conflictRaw === null || conflictRaw === undefined ? null : String(conflictRaw);
    return {
      userId,
      fullName,
      isAvailable,
      isConflict: !isAvailable,
      conflictReason: isAvailable ? null : conflictReason,
    };
  });
}

export function parseConflictCheck(raw: unknown): { conflict: boolean; message?: string } {
  const inner = unwrapBody(raw);
  if (inner && typeof inner === 'object') {
    const o = inner as Record<string, unknown>;
    return {
      conflict: Boolean(o.conflict ?? o.hasConflict ?? o.isConflict),
      message: typeof o.message === 'string' ? o.message : undefined,
    };
  }
  return { conflict: false };
}

export function parseSessionDetail(raw: unknown): SessionDetailPayload | null {
  const inner = unwrapBody(raw);
  if (!inner || typeof inner !== 'object') return null;
  const obj = inner as Record<string, unknown>;
  const session = (obj.session as Record<string, unknown> | undefined) ?? obj;

  const id = String(session.id ?? obj.id ?? '');
  if (!id) return null;

  const classId = String(session.classId ?? obj.classId ?? '');
  const scheduledDate = String(
    session.scheduledDate ?? session.sessionDate ?? session.date ?? session.session_date ?? '',
  );
  const status = String(session.status ?? 'pending');
  const mainTeacherId = session.mainTeacherId
    ? String(session.mainTeacherId)
    : session.teacherId
      ? String(session.teacherId)
      : undefined;
  const coverTeacherId =
    session.coverTeacherId !== undefined && session.coverTeacherId !== null
      ? String(session.coverTeacherId)
      : null;

  const coverTeacherName =
    session.coverTeacherName !== undefined && session.coverTeacherName !== null
      ? String(session.coverTeacherName)
      : null;

  const coverStatus =
    session.coverStatus !== undefined && session.coverStatus !== null ? String(session.coverStatus) : null;

  const coverReason =
    session.coverReason !== undefined && session.coverReason !== null ? String(session.coverReason) : null;

  let attendanceRows: SessionAttendanceRow[] = [];
  const rawRows =
    (obj.attendanceRows as unknown[]) ??
    (obj.attendance as unknown[]) ??
    (obj.roster as unknown[]) ??
    (session.attendees as unknown[]);

  if (Array.isArray(rawRows)) {
    attendanceRows = rawRows.map((row) => {
      const r = row as Record<string, unknown>;
      return {
        enrollmentId: String(r.enrollmentId ?? r.enrollment_id ?? r.id ?? ''),
        studentId:
          r.studentId != null
            ? String(r.studentId)
            : r.student_id != null
              ? String(r.student_id)
              : undefined,
        studentCode:
          r.studentCode != null
            ? String(r.studentCode)
            : r.student_code != null
              ? String(r.student_code)
              : null,
        studentName: String(r.studentName ?? r.fullName ?? r.student_name ?? ''),
        status: r.status ? String(r.status) : null,
        note: r.note != null ? String(r.note) : null,
      };
    });
  }

  return {
    id,
    classId,
    classCode: session.classCode ? String(session.classCode) : undefined,
    sessionNo:
      session.sessionNo != null
        ? Number(session.sessionNo)
        : session.session_no != null
          ? Number(session.session_no)
          : undefined,
    scheduledDate,
    shiftLabel: session.shiftLabel ? String(session.shiftLabel) : undefined,
    roomName: session.roomName ? String(session.roomName) : undefined,
    mainTeacherName: session.mainTeacherName
      ? String(session.mainTeacherName)
      : session.teacherName
        ? String(session.teacherName)
        : undefined,
    mainTeacherId,
    coverTeacherId,
    coverTeacherName,
    coverStatus,
    coverReason,
    status,
    submittedAt:
      session.submittedAt != null
        ? String(session.submittedAt)
        : session.submitted_at != null
          ? String(session.submitted_at)
          : null,
    submittedBy:
      session.submittedBy != null
        ? String(session.submittedBy)
        : session.submitted_by != null
          ? String(session.submitted_by)
          : null,
    lastEditedAt:
      session.lastEditedAt != null
        ? String(session.lastEditedAt)
        : session.last_edited_at != null
          ? String(session.last_edited_at)
          : null,
    lastEditedBy:
      session.lastEditedBy != null
        ? String(session.lastEditedBy)
        : session.last_edited_by != null
          ? String(session.last_edited_by)
          : null,
    attendanceRows,
  };
}
