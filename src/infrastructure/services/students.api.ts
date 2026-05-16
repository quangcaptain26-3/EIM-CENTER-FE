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
  /** Chỉ HV không có ghi danh trial/active/paused */
  withoutActiveEnrollment?: boolean;
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
  const body =
    data && typeof data === 'object'
      ? {
          ...data,
          studentId: (data as Record<string, unknown>).studentId ?? (data as Record<string, unknown>).student_id,
          classId: (data as Record<string, unknown>).classId ?? (data as Record<string, unknown>).class_id,
        }
      : data;
  const res = await apiClient.post('/enrollments', body);
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
  const enrollmentId = id?.trim();
  if (!enrollmentId || enrollmentId === 'undefined') {
    throw new Error('Thiếu mã ghi danh (enrollment id). Vui lòng tải lại trang học viên.');
  }
  const { enrollmentId: _omit, enrollment_id: _omit2, id: _omit3, ...body } = data as Record<string, unknown>;
  const res = await apiClient.post(`/enrollments/${enrollmentId}/pause`, body);
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

export async function cancelReservation(
  id: string,
  data: { reasonDetail: string },
): Promise<EnrollmentResponse> {
  const res = await apiClient.post(`/enrollments/${id}/cancel-reservation`, data);
  return unwrapApiData<EnrollmentResponse>(res);
}

export async function reassignReservedClass(
  id: string,
  data: { newClassId: string },
): Promise<EnrollmentResponse> {
  const res = await apiClient.post(`/enrollments/${id}/reassign-reserved-class`, data);
  return unwrapApiData<EnrollmentResponse>(res);
}

export interface TransferReservationResult {
  oldEnrollmentId: string;
  newEnrollmentId: string;
  credit: number;
  newTuition: number;
  newReservationFee: number;
  appliedToDeposit: number;
  appliedToRemaining: number;
  depositShortfall: number;
}

export async function transferReservation(
  id: string,
  data: { newClassId: string; reasonDetail: string },
): Promise<TransferReservationResult> {
  const res = await apiClient.post(`/enrollments/${id}/transfer-reservation`, data);
  return unwrapApiData<TransferReservationResult>(res);
}

/** Q15: Admin mở khóa học bù — body.reason ≥ 10 ký tự (BE validate). */
export async function resetMakeupBlocked(
  enrollmentId: string,
  body: { reason: string },
): Promise<{ success: boolean; enrollmentId: string; makeupBlocked: boolean }> {
  const res = await apiClient.post(`/enrollments/${enrollmentId}/reset-makeup-blocked`, body);
  return unwrapApiData(res);
}

/** Q16: alias spec — cùng filter với GET /classes/suggestions + meta.hint. */
export async function getScheduleConflictCheck(params: {
  unavailableDays?: number[];
  programId?: string;
}): Promise<{ classes: Array<Record<string, unknown>>; hint?: string }> {
  const res = await apiClient.get('/schedule/conflict-check', {
    params: compactParams({
      unavailableDays: params.unavailableDays?.join(','),
      programId: params.programId,
    }),
  });
  const unwrapped = unwrapApiData<
    Array<Record<string, unknown>> | { data: Array<Record<string, unknown>>; meta?: { hint?: string } }
  >(res);
  if (Array.isArray(unwrapped)) {
    return { classes: unwrapped };
  }
  const o = unwrapped as { data?: Array<Record<string, unknown>>; meta?: { hint?: string } };
  return { classes: o.data ?? [], hint: o.meta?.hint };
}

export interface TransferEnrollmentBody {
  fromEnrollmentId: string;
  toStudentId: string;
  toClassId: string;
}

export async function transferEnrollment(data: TransferEnrollmentBody): Promise<void> {
  await apiClient.post('/enrollments/transfer', data);
}

export async function getClassSuggestions(params: {
  unavailableDays?: number[];
  programId?: string;
}): Promise<Array<Record<string, unknown>>> {
  const res = await apiClient.get('/classes/suggestions', {
    params: compactParams({
      unavailableDays: params.unavailableDays?.join(','),
      programId: params.programId,
    }),
  });
  const data = unwrapApiData<{ data?: Array<Record<string, unknown>> } | Array<Record<string, unknown>>>(res);
  if (Array.isArray(data)) return data;
  return data?.data ?? [];
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

/** Xem trước trùng lịch phòng/GV khi đặt học bù — khớp POST /makeup-sessions validation phía BE. */
export interface MakeupConflictPreviewParams {
  makeupDate: string;
  shift: 1 | 2;
  roomId: string;
  teacherId: string;
}

export interface MakeupConflictPreviewResult {
  room: { hasConflict: boolean; conflictReason: string | null };
  teacher: { hasConflict: boolean; conflictReason: string | null };
  canProceed: boolean;
}

export async function previewMakeupConflict(
  params: MakeupConflictPreviewParams,
): Promise<MakeupConflictPreviewResult> {
  const res = await apiClient.get('/makeup-sessions/conflict-preview', {
    params: compactParams(params as unknown as Record<string, unknown>),
  });
  return unwrapApiData<MakeupConflictPreviewResult>(res);
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
