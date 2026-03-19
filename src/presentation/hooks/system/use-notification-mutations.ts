/**
 * use-notification-mutations.ts
 * Hook quản lý các thao tác cập nhật dữ liệu thông báo (đánh dấu đã đọc).
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/infrastructure/query/query-keys';
import { systemApi } from '@/infrastructure/services/system.api';
import { toastAdapter } from '@/infrastructure/adapters/toast.adapter';

/**
 * Hook đánh dấu một thông báo cụ thể là đã đọc.
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => systemApi.markNotificationRead(id),
    onSuccess: () => {
      // Invalidate cache để cập nhật danh sách và badge
      queryClient.invalidateQueries({ queryKey: ['system', 'notifications'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.system.unreadCount });
    },
    onError: () => {
      toastAdapter.error('Không thể cập nhật trạng thái thông báo');
    },
  });
}

/**
 * Hook đánh dấu tất cả thông báo là đã đọc.
 */
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => systemApi.markAllNotificationsRead(),
    onMutate: async () => {
      // 1. Dừng các query dang fetch để tránh ghi đè
      await queryClient.cancelQueries({ queryKey: queryKeys.system.unreadCount });
      
      // 2. Lưu lại count cũ để rollback nếu lỗi
      const previousCount = queryClient.getQueryData(queryKeys.system.unreadCount);
      
      // 3. Optimistic update: set count về 0 ngay lập tức
      queryClient.setQueryData(queryKeys.system.unreadCount, 0);

      // (Tuỳ chọn) Đánh dấu isRead=true trên mọi trang cache của danh sách thông báo
      queryClient.setQueriesData({ queryKey: ['system', 'notifications'] }, (oldData: any) => {
        if (!oldData || !oldData.items) return oldData;
        return {
          ...oldData,
          items: oldData.items.map((item: any) => ({ ...item, isRead: true }))
        };
      });

      return { previousCount };
    },
    onSuccess: () => {
      toastAdapter.success('Đã đánh dấu tất cả là đã đọc');
      // Invalidate đồng thời cả 2 bộ query để đảm bảo đồng bộ
      queryClient.invalidateQueries({ queryKey: ['system', 'notifications'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.system.unreadCount });
    },
    onError: (_err, _variables, context) => {
      // 4. Rollback nếu có lỗi
      if (context?.previousCount !== undefined) {
        queryClient.setQueryData(queryKeys.system.unreadCount, context.previousCount);
      }
      toastAdapter.error('Có lỗi xảy ra khi cập nhật thông báo');
    },
  });
}
