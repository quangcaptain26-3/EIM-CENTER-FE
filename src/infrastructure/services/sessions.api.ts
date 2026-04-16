import { apiClient } from '@/app/config/axios';
import type {
  AttendanceRecord,
  CoverTeacherCandidate,
  SessionDetailResponse,
  SessionResponse,
} from '@/shared/types/api-contract';
import { unwrapApiData } from '@/infrastructure/services/api-unwrap.util';
import { compactParams } from '@/infrastructure/services/query-params.util';

export async function getSession(id: string): Promise<SessionDetailResponse> {
  const res = await apiClient.get(`/sessions/${id}`);
  return unwrapApiData<SessionDetailResponse>(res);
}

export async function getAvailableCovers(sessionId: string): Promise<CoverTeacherCandidate[]> {
  const res = await apiClient.get(`/sessions/${sessionId}/available-covers`);
  return unwrapApiData<CoverTeacherCandidate[]>(res);
}

export interface AssignCoverBody {
  coverTeacherId: string;
  reason: string | null;
}

export async function assignCover(
  sessionId: string,
  data: AssignCoverBody | Record<string, unknown>,
): Promise<SessionResponse> {
  const res = await apiClient.post(`/sessions/${sessionId}/cover`, data);
  return unwrapApiData<SessionResponse>(res);
}

export async function cancelCover(sessionId: string): Promise<SessionResponse> {
  const res = await apiClient.delete(`/sessions/${sessionId}/cover`);
  return unwrapApiData<SessionResponse>(res);
}

export interface RescheduleSessionBody {
  newDate: string;
  reason: string;
}

export async function rescheduleSession(
  sessionId: string,
  data: RescheduleSessionBody | Record<string, unknown>,
): Promise<SessionResponse> {
  const res = await apiClient.patch(`/sessions/${sessionId}/reschedule`, data);
  return unwrapApiData<SessionResponse>(res);
}

/** month có thể là số hoặc chuỗi (YYYY-MM) tuỳ convention BE */
export interface MySessionsParams {
  month?: number | string;
  year?: number;
}

export async function getMySessions(params: MySessionsParams): Promise<SessionResponse[]> {
  const res = await apiClient.get('/my-sessions', {
    params: compactParams(params as Record<string, unknown>),
  });
  return unwrapApiData<SessionResponse[]>(res);
}

export async function recordAttendance(
  sessionId: string,
  payload: AttendanceRecord[] | { records: AttendanceRecord[] } | Record<string, unknown>,
): Promise<void> {
  let records: AttendanceRecord[];
  if (Array.isArray(payload)) {
    records = payload;
  } else if ('records' in payload && Array.isArray(payload.records)) {
    records = payload.records as AttendanceRecord[];
  } else {
    records = (payload as { records?: AttendanceRecord[] }).records ?? [];
  }
  await apiClient.post(`/sessions/${sessionId}/attendance`, { records });
}

/** GET /sessions/:id/conflict-check?date= — kiểm tra lịch khi đổi lịch buổi */
export async function getSessionConflictCheck(sessionId: string, date: string): Promise<unknown> {
  const res = await apiClient.get(`/sessions/${sessionId}/conflict-check`, { params: { date } });
  return unwrapApiData(res);
}

/** @deprecated dùng rescheduleSession */
export const reschedule = rescheduleSession;
