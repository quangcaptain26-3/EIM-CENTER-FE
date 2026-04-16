import { apiClient } from '@/app/config/axios';
import type { ApiResponse } from '@/shared/types/api.type';

export function getNotifications(params?: { limit?: number }) {
  return apiClient.get<ApiResponse<unknown>>('/notifications', {
    params: { limit: params?.limit ?? 10 },
  });
}

/** Đánh dấu tất cả đã đọc — đổi endpoint nếu BE khác */
export function markAllNotificationsRead() {
  return apiClient.post<ApiResponse<unknown>>('/notifications/read-all');
}
