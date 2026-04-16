import { apiClient } from '@/app/config/axios';
import { unwrapApiData } from '@/infrastructure/services/api-unwrap.util';
import type { DashboardStats } from '@/shared/types/dashboard-stats.type';

export async function getDashboardStats(): Promise<DashboardStats> {
  const raw = await apiClient.get<unknown>('/dashboard/stats');
  return unwrapApiData<DashboardStats>(raw);
}
