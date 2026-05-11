import { AxiosHeaders } from 'axios';
import { apiClient } from '@/app/config/axios';
import type {
  AuditLog,
  GlobalSearchResponse,
  ImportResult,
  PagedResponse,
  StudentSearchItem,
} from '@/shared/types/api-contract';
import { unwrapApiData } from '@/infrastructure/services/api-unwrap.util';
import { compactParams } from '@/infrastructure/services/query-params.util';

export async function globalSearch(q: string): Promise<GlobalSearchResponse> {
  const res = await apiClient.get('/search', { params: { q } });
  return unwrapApiData<GlobalSearchResponse>(res);
}

export interface SearchStudentsParams {
  q: string;
  limit?: number;
}

export async function searchStudents(params: SearchStudentsParams): Promise<StudentSearchItem[]> {
  const res = await apiClient.get('/search/students', {
    params: compactParams(params as unknown as Record<string, unknown>),
  });
  return unwrapApiData<StudentSearchItem[]>(res);
}

export interface AuditLogsListParams {
  page?: number;
  limit?: number;
  domain?: string;
  actorCode?: string;
  entityCode?: string;
  dateFrom?: string;
  dateTo?: string;
  // Backward compatible fields (nếu còn dùng ở nơi khác)
  action?: string;
  entityType?: string;
  fromDate?: string;
  toDate?: string;
}

export async function getAuditLogs(params?: AuditLogsListParams): Promise<PagedResponse<AuditLog>> {
  const res = await apiClient.get('/audit-logs', {
    params: params ? compactParams(params as Record<string, unknown>) : undefined,
  });
  return unwrapApiData<PagedResponse<AuditLog>>(res);
}

export async function importData(
  type: string,
  file: File,
  mode: 'preview' | 'commit',
): Promise<ImportResult> {
  const formData = new FormData();
  formData.append('file', file);
  const headers = new AxiosHeaders();
  headers.delete('Content-Type');
  const res = await apiClient.post(`/import/${type}?mode=${encodeURIComponent(mode)}`, formData, { headers });
  return unwrapApiData<ImportResult>(res);
}

export async function exportData(type: string, params?: Record<string, unknown>): Promise<Blob> {
  const res = await apiClient.get<Blob>(`/export/${type}`, {
    params: params ? compactParams(params) : undefined,
    responseType: 'blob',
  });
  return res as unknown as Blob;
}

export async function downloadTemplate(type: string): Promise<Blob> {
  const res = await apiClient.get<Blob>(`/templates/${type}`, { responseType: 'blob' });
  return res as unknown as Blob;
}

export async function exportAuditLogs(params?: Record<string, unknown>): Promise<Blob> {
  return exportData('audit-logs', params);
}
