import { apiClient } from '@/app/config/axios';
import type {
  PagedResponse,
  SalaryLog,
  UserResponse,
  UserRoleCode,
} from '@/shared/types/api-contract';
import { unwrapApiData } from '@/infrastructure/services/api-unwrap.util';
import { compactParams } from '@/infrastructure/services/query-params.util';

export interface UsersListParams {
  page?: number;
  limit?: number;
  role?: UserRoleCode | string;
  search?: string;
  isActive?: boolean;
}

export async function getUsers(params?: UsersListParams): Promise<PagedResponse<UserResponse>> {
  const res = await apiClient.get('/users', { params: params ? compactParams(params as Record<string, unknown>) : undefined });
  return unwrapApiData<PagedResponse<UserResponse>>(res);
}

export async function getUser(id: string): Promise<UserResponse> {
  const res = await apiClient.get(`/users/${id}`);
  return unwrapApiData<UserResponse>(res);
}

export async function createUser(data: Record<string, unknown>): Promise<UserResponse> {
  const res = await apiClient.post('/users', data);
  return unwrapApiData<UserResponse>(res);
}

export async function updateUser(id: string, data: Record<string, unknown>): Promise<UserResponse> {
  const res = await apiClient.patch(`/users/${id}`, data);
  return unwrapApiData<UserResponse>(res);
}

export interface UpdateSalaryBody {
  salaryPerSession?: number | null;
  allowance?: number | null;
  reason: string;
}

export async function updateSalary(
  id: string,
  data: UpdateSalaryBody | Record<string, unknown>,
): Promise<UserResponse> {
  const res = await apiClient.patch(`/users/${id}/salary`, data);
  return unwrapApiData<UserResponse>(res);
}

export async function getSalaryLogs(id: string): Promise<SalaryLog[]> {
  const res = await apiClient.get(`/users/${id}/salary-logs`);
  return unwrapApiData<SalaryLog[]>(res);
}

export async function deleteUser(id: string): Promise<void> {
  await apiClient.delete(`/users/${id}`);
}

/** @deprecated dùng UsersListParams */
export type UsersListQuery = UsersListParams;
