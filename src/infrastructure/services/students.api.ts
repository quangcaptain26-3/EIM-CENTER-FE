import { apiClient } from '@/app/config/axios';
import type {
  AttendanceRecord,
  EnrollmentResponse,
  MakeupSession,
  PagedResponse,
  PauseEnrollmentOutcome,
  PauseRequest,
  StudentResponse,
} from '@/shared/types/api-contract';
import { unwrapApiData } from '@/infrastructure/services/api-unwrap.util';
import { compactParams } from '@/infrastructure/services/query-params.util';

export interface StudentsListParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  programCode?: string;
  /** UUID chương trình — khớp GET /students?programId= */
  programId?: string;
  /** Tên cấp hiển thị (Kindy, Starters, Flyers…) — BE map sang programs.code */
  level?: string;
  enrollmentStatus?: string;
  classId?: string;
}

export async function getStudents(params?: StudentsListParams): Promise<PagedResponse<StudentResponse>> {
  const res = await apiClient.get('/students', {
    params: params ? compactParams(params as Record<string, unknown>) : undefined,
  });
  return unwrapApiData<PagedResponse<StudentResponse>>(res);
}

export async function getStudent(id: string): Promise<StudentResponse> {
  const res = await apiClient.get(`/students/${id}`);
  return unwrapApiData<StudentResponse>(res);
}

export async function createStudent(data: Record<string, unknown>): Promise<StudentResponse> {
  const res = await apiClient.post('/students', data);
  return unwrapApiData<StudentResponse>(res);
}

export async function updateStudent(id: string, data: Record<string, unknown>): Promise<StudentResponse> {
  const res = await apiClient.patch(`/students/${id}`, data);
  return unwrapApiData<StudentResponse>(res);
}

export async function getStudentEnrollments(studentId: string): Promise<EnrollmentResponse[]> {
  const res = await apiClient.get(`/students/${studentId}/enrollments`);
  return unwrapApiData<EnrollmentResponse[]>(res);
}

export interface CreateEnrollmentBody {
  studentId: string;
  classId: string;
}

export async function createEnrollment(
  data: CreateEnrollmentBody | Record<string, unknown>,
): Promise<EnrollmentResponse> {
  const res = await apiClient.post('/enrollments', data);
  return unwrapApiData<EnrollmentResponse>(res);
}

export async function activateEnrollment(
  id: string,
  body?: Record<string, unknown>,
): Promise<EnrollmentResponse> {
  const res = await apiClient.post(`/enrollments/${id}/activate`, body ?? {});
  return unwrapApiData<EnrollmentResponse>(res);
}

export async function startTrial(id: string): Promise<EnrollmentResponse> {
  const res = await apiClient.post(`/enrollments/${id}/start-trial`);
  return unwrapApiData<EnrollmentResponse>(res);
}

/** @deprecated dùng startTrial */
export const startTrialEnrollment = startTrial;

export interface DropEnrollmentBody {
  reasonType: string;
  reasonDetail: string;
}

export async function dropEnrollment(
  id: string,
  data: DropEnrollmentBody | Record<string, unknown>,
): Promise<EnrollmentResponse> {
  const res = await apiClient.post(`/enrollments/${id}/drop`, data);
  return unwrapApiData<EnrollmentResponse>(res);
}

export interface PauseEnrollmentBody {
  reason: string;
}

export function parsePauseEnrollmentResult(raw: unknown): PauseEnrollmentOutcome {
  const inner = unwrapApiData(raw);
  if (!inner || typeof inner !== 'object') {
    throw new Error('Invalid pause response');
  }
  const o = inner as Record<string, unknown>;
  if (o.requiresApproval === true && typeof o.requestId === 'string') {
    return { kind: 'needsApproval', requestId: o.requestId };
  }
  if (o.requiresApproval === false && o.enrollment && typeof o.enrollment === 'object') {
    return { kind: 'paused', enrollment: o.enrollment as EnrollmentResponse };
  }
  if ('id' in o && 'status' in o && o.requiresApproval === undefined) {
    return { kind: 'paused', enrollment: inner as EnrollmentResponse };
  }
  throw new Error('Unexpected pause response');
}

export async function pauseEnrollment(
  id: string,
  data: PauseEnrollmentBody | Record<string, unknown>,
): Promise<PauseEnrollmentOutcome> {
  const res = await apiClient.post(`/enrollments/${id}/pause`, data);
  return parsePauseEnrollmentResult(res);
}

export async function resumeEnrollment(id: string): Promise<EnrollmentResponse> {
  const res = await apiClient.post(`/enrollments/${id}/resume`);
  return unwrapApiData<EnrollmentResponse>(res);
}

export interface TransferClassBody {
  newClassId: string;
}

export async function transferClass(
  id: string,
  data: TransferClassBody | Record<string, unknown>,
): Promise<EnrollmentResponse> {
  const res = await apiClient.post(`/enrollments/${id}/transfer-class`, data);
  return unwrapApiData<EnrollmentResponse>(res);
}

export interface TransferEnrollmentBody {
  fromEnrollmentId: string;
  toStudentId: string;
  toClassId: string;
}

export async function transferEnrollment(data: TransferEnrollmentBody): Promise<void> {
  await apiClient.post('/enrollments/transfer', data);
}

export interface PauseRequestsListParams {
  status?: string;
  /** Lọc theo ghi danh (khi BE hỗ trợ) */
  enrollmentId?: string;
  page?: number;
  limit?: number;
}

export async function getPauseRequests(
  params?: PauseRequestsListParams,
): Promise<PagedResponse<PauseRequest>> {
  const res = await apiClient.get('/pause-requests', {
    params: params ? compactParams(params as Record<string, unknown>) : undefined,
  });
  return unwrapApiData<PagedResponse<PauseRequest>>(res);
}

export async function approvePauseRequest(id: string, reviewNote?: string): Promise<void> {
  await apiClient.patch(`/pause-requests/${id}/approve`, reviewNote ? { reviewNote } : {});
}

export async function rejectPauseRequest(id: string, reviewNote: string): Promise<void> {
  await apiClient.patch(`/pause-requests/${id}/reject`, { reviewNote });
}

export async function createMakeupSession(data: Record<string, unknown>): Promise<MakeupSession> {
  const res = await apiClient.post('/makeup-sessions', data);
  return unwrapApiData<MakeupSession>(res);
}

export async function completeMakeup(id: string): Promise<void> {
  await apiClient.patch(`/makeup-sessions/${id}/complete`);
}

/** @deprecated dùng completeMakeup */
export const completeMakeupSession = completeMakeup;

export interface MakeupSessionsListParams {
  page?: number;
  limit?: number;
  studentId?: string;
  enrollmentId?: string;
  status?: string;
}

export async function getMakeupSessions(
  params?: MakeupSessionsListParams,
): Promise<PagedResponse<MakeupSession>> {
  const res = await apiClient.get('/makeup-sessions', {
    params: params ? compactParams(params as Record<string, unknown>) : undefined,
  });
  return unwrapApiData<PagedResponse<MakeupSession>>(res);
}

export async function cancelMakeupSession(id: string): Promise<void> {
  await apiClient.patch(`/makeup-sessions/${id}/cancel`, {});
}

/** @deprecated dùng getStudentEnrollments */
export const getEnrollments = getStudentEnrollments;

export async function getAttendanceHistory(enrollmentId: string): Promise<AttendanceRecord[]> {
  const res = await apiClient.get(`/enrollments/${enrollmentId}/attendance`);
  return unwrapApiData<AttendanceRecord[]>(res);
}

/** @deprecated dùng getAttendanceHistory */
export const getAttendance = getAttendanceHistory;
