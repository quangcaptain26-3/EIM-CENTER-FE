import { apiClient } from '@/app/config/axios';
import type {
  ClassResponse,
  EnrollmentResponse,
  GenerateSessionsResult,
  PagedResponse,
  ProgramResponse,
  ProgramCode,
  RoomResponse,
  SessionResponse,
} from '@/shared/types/api-contract';
import { unwrapApiData } from '@/infrastructure/services/api-unwrap.util';
import { compactParams } from '@/infrastructure/services/query-params.util';

export interface ClassesListParams {
  page?: number;
  limit?: number;
  programCode?: ProgramCode | string;
  status?: string;
  search?: string;
}

export async function getClasses(params?: ClassesListParams): Promise<PagedResponse<ClassResponse>> {
  const res = await apiClient.get('/classes', {
    params: params ? compactParams(params as Record<string, unknown>) : undefined,
  });
  return unwrapApiData<PagedResponse<ClassResponse>>(res);
}

export async function getUpcomingClasses(): Promise<ClassResponse[]> {
  const res = await apiClient.get('/upcoming');
  return unwrapApiData<ClassResponse[]>(res);
}

export async function getClass(id: string): Promise<ClassResponse> {
  const res = await apiClient.get(`/classes/${id}`);
  return unwrapApiData<ClassResponse>(res);
}

export async function createClass(data: Record<string, unknown>): Promise<ClassResponse> {
  const res = await apiClient.post('/classes', data);
  return unwrapApiData<ClassResponse>(res);
}

export async function updateClass(id: string, data: Record<string, unknown>): Promise<ClassResponse> {
  const res = await apiClient.patch(`/classes/${id}`, data);
  return unwrapApiData<ClassResponse>(res);
}

export async function generateSessions(
  classId: string,
  startDateOrBody: string | Record<string, unknown>,
): Promise<GenerateSessionsResult> {
  const startDate =
    typeof startDateOrBody === 'string'
      ? startDateOrBody
      : String((startDateOrBody as { startDate?: string }).startDate ?? '');
  const res = await apiClient.post(`/classes/${classId}/generate-sessions`, { startDate });
  return unwrapApiData<GenerateSessionsResult>(res);
}

export async function getRoster(
  classId: string,
  params?: { page?: number; limit?: number },
): Promise<PagedResponse<EnrollmentResponse>> {
  const res = await apiClient.get(`/classes/${classId}/roster`, {
    params: params ? compactParams(params as Record<string, unknown>) : undefined,
  });
  return unwrapApiData<PagedResponse<EnrollmentResponse>>(res);
}

export async function getClassSessions(classId: string): Promise<SessionResponse[]> {
  const res = await apiClient.get(`/classes/${classId}/sessions`);
  return unwrapApiData<SessionResponse[]>(res);
}

export interface ClassAttendanceMatrixCell {
  sessionId: string;
  studentId: string;
  status: string;
  attendanceId: string;
}

export interface ClassAttendanceMatrixPayload {
  classId: string;
  classCode: string;
  students: {
    enrollmentId: string;
    studentId: string;
    studentCode: string | null;
    studentName: string;
    status: string;
  }[];
  sessions: {
    id: string;
    sessionNo: number;
    sessionDate: string;
    status: string;
    shift: number;
    submittedAt?: string | null;
    submittedByName?: string | null;
    lastEditedAt?: string | null;
    lastEditedByName?: string | null;
  }[];
  cells: ClassAttendanceMatrixCell[];
}

export async function getClassAttendanceMatrix(classId: string): Promise<ClassAttendanceMatrixPayload> {
  const res = await apiClient.get(`/classes/${classId}/attendance-matrix`);
  return unwrapApiData<ClassAttendanceMatrixPayload>(res);
}

export interface ReplaceTeacherBody {
  newTeacherId: string;
  fromSessionNo: number;
  reason: string;
}

export async function replaceTeacher(
  classId: string,
  data: ReplaceTeacherBody | Record<string, unknown>,
): Promise<ClassResponse> {
  const res = await apiClient.post(`/classes/${classId}/replace-teacher`, data);
  return unwrapApiData<ClassResponse>(res);
}

export async function closeClass(
  classId: string,
  options?: { force?: boolean },
): Promise<ClassResponse> {
  const body = options?.force ? { force: true } : {};
  const res = await apiClient.post(`/classes/${classId}/close`, body);
  return unwrapApiData<ClassResponse>(res);
}

export async function announceClass(classId: string): Promise<ClassResponse> {
  const res = await apiClient.patch(`/classes/${classId}/announce`);
  return unwrapApiData<ClassResponse>(res);
}

export async function getPrograms(): Promise<ProgramResponse[]> {
  const res = await apiClient.get('/programs');
  return unwrapApiData<ProgramResponse[]>(res);
}

export async function updateProgramDefaultFee(
  programId: string,
  body: { defaultFee: number },
): Promise<ProgramResponse> {
  const res = await apiClient.patch(`/programs/${programId}`, body);
  return unwrapApiData<ProgramResponse>(res);
}

export async function getRooms(): Promise<RoomResponse[]> {
  const res = await apiClient.get('/rooms');
  return unwrapApiData<RoomResponse[]>(res);
}
