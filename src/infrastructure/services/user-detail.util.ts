import type { ApiResponse } from '@/shared/types/api.type';
import type { UserResponse } from '@/shared/types/api-contract';
import type { SalaryLogEntry, StaffUserDetail } from '@/shared/types/user.type';
import { mapUserResponseToStaffDetail } from '@/shared/lib/map-user-response';

export function parseStaffUserDetail(raw: unknown): StaffUserDetail | null {
  if (!raw || typeof raw !== 'object') return null;

  const wrapped = raw as ApiResponse<unknown>;
  let body: unknown = raw;
  if ('data' in wrapped && wrapped.data !== undefined && typeof wrapped.data === 'object') {
    body = wrapped.data;
  }

  const o = body as Record<string, unknown>;
  if (!('id' in o) || !('userCode' in o) || typeof o.userCode !== 'string') {
    return null;
  }

  if (o.role && typeof o.role === 'object' && o.role !== null && 'code' in o.role) {
    return mapUserResponseToStaffDetail(body as UserResponse);
  }

  return body as StaffUserDetail;
}

export function parseSalaryLogs(raw: unknown): SalaryLogEntry[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as SalaryLogEntry[];

  if (typeof raw !== 'object') return [];
  const body = raw as Record<string, unknown>;

  if (Array.isArray(body.data)) return body.data as SalaryLogEntry[];

  const inner = (raw as ApiResponse<unknown>).data;
  if (Array.isArray(inner)) return inner as SalaryLogEntry[];
  if (inner && typeof inner === 'object' && 'data' in inner && Array.isArray((inner as { data: unknown }).data)) {
    return (inner as { data: SalaryLogEntry[] }).data;
  }
  return [];
}
