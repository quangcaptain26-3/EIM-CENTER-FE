import type {
  GlobalSearchClassHit,
  GlobalSearchResponse,
  GlobalSearchStudentHit,
  GlobalSearchUserHit,
} from '@/shared/types/global-search.type';
import type { ApiResponse } from '@/shared/types/api.type';

function unwrap(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as ApiResponse<unknown>;
  const d = r.data !== undefined ? r.data : raw;
  return d && typeof d === 'object' && !Array.isArray(d) ? (d as Record<string, unknown>) : null;
}

function str(v: unknown): string {
  return v == null ? '' : String(v);
}

function mapStudent(row: Record<string, unknown>): GlobalSearchStudentHit {
  return {
    id: str(row.id ?? row._id),
    fullName: str(row.fullName ?? row.name),
    studentCode: str(row.studentCode ?? row.code),
    status: str(row.status ?? row.enrollmentStatus) || undefined,
  };
}

function mapUser(row: Record<string, unknown>): GlobalSearchUserHit {
  return {
    id: str(row.id ?? row._id),
    fullName: str(row.fullName ?? row.name),
    userCode: str(row.userCode ?? row.code) || undefined,
    roleCode: str(row.roleCode ?? row.role) || undefined,
  };
}

function mapClass(row: Record<string, unknown>): GlobalSearchClassHit {
  const prog = row.program;
  const progName =
    prog && typeof prog === 'object' && 'name' in prog ? (prog as { name?: unknown }).name : undefined;
  return {
    id: str(row.id ?? row.classId ?? row._id),
    classCode: str(row.classCode ?? row.code),
    programName: str(row.programName ?? progName) || undefined,
    status: str(row.status) || undefined,
  };
}

export function parseGlobalSearchResponse(raw: unknown): GlobalSearchResponse {
  const o = unwrap(raw);
  if (!o) {
    return { students: [], users: [], classes: [] };
  }

  const studentsRaw = o.students ?? o.student;
  const usersRaw = o.users ?? o.user;
  const classesRaw = o.classes ?? o.class;

  const students = Array.isArray(studentsRaw)
    ? (studentsRaw as Record<string, unknown>[]).map(mapStudent).filter((s) => s.id)
    : [];
  const users = Array.isArray(usersRaw)
    ? (usersRaw as Record<string, unknown>[]).map(mapUser).filter((u) => u.id)
    : [];
  const classes = Array.isArray(classesRaw)
    ? (classesRaw as Record<string, unknown>[]).map(mapClass).filter((c) => c.id)
    : [];

  return { students, users, classes };
}
