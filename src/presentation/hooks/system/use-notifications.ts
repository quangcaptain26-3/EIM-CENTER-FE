/**
 * use-notifications.ts
 * Hook quản lý danh sách thông báo và số lượng thông báo chưa đọc.
 * Tự động cập nhật số lượng thông báo chưa đọc sau mỗi 30 giây.
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/infrastructure/query/query-keys';
import { systemApi } from '@/infrastructure/services/system.api';
import { mapToNotificationModel } from '@/application/system/mappers/system.mapper';
import type { ListNotificationsDto } from '@/application/system/dto/system.dto';

/**
 * Hook lấy danh sách thông báo của người dùng hiện tại.
 * @param params Tham số lọc và phân trang
 */
export function useNotifications(params?: ListNotificationsDto) {
  return useQuery({
    queryKey: queryKeys.system.notifications(params),
    queryFn: async () => {
      const response = await systemApi.listNotifications(params);
      // Chuyển đổi dữ liệu thô từ API sang Domain Model
      return {
        ...response.data,
        items: (response.data as any).items.map(mapToNotificationModel),
        total: (response.data as any).total as number,
      };
    },
  });
}

/**
 * Hook lấy số lượng thông báo chưa đọc (dùng cho Badge trên Header).
 * Thực hiện polling mỗi 30 giây để đảm bảo thông tin luôn mới.
 */
export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: queryKeys.system.unreadCount,
    queryFn: async () => {
      // Gọi API lấy thông báo chưa đọc với limit=1 để tối ưu performance
      const response = await systemApi.listNotifications({ isRead: 'false', limit: 1 });
      // Lấy thuộc tính total từ kết quả phân trang của backend
      return (response.data as any).total as number;
    },
    refetchInterval: 30000, // Polling mỗi 30 giây
    staleTime: 25000,
  });
}
