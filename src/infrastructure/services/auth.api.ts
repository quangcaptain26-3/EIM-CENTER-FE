import { apiClient } from '@/app/config/axios';
import type { LoginResponse, UserResponse } from '@/shared/types/api-contract';
import { unwrapApiData } from '@/infrastructure/services/api-unwrap.util';

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await apiClient.post('/auth/login', { email, password });
  return unwrapApiData<LoginResponse>(res);
}

export async function refresh(
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const res = await apiClient.post('/auth/refresh', { refreshToken });
  return unwrapApiData<{ accessToken: string; refreshToken: string }>(res);
}

export async function logout(refreshToken: string): Promise<void> {
  await apiClient.post('/auth/logout', { refreshToken });
}

export async function getMe(): Promise<UserResponse> {
  const res = await apiClient.get('/auth/me');
  return unwrapApiData<UserResponse>(res);
}
