import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markAllNotificationsRead } from '@/infrastructure/services/notifications.api';
import { QUERY_KEYS } from '@/infrastructure/query/query-keys';
import {
  parseNotificationsList,
  parseUnreadCount,
  patchNotificationsMarkAllRead,
} from '@/infrastructure/services/notification-parse.util';

const LIMIT = 10;

/**
 * Optimistic update chỉ dùng cho thao tác rủi ro thấp (đánh dấu đã đọc).
 * Không áp dụng pattern này cho tài chính, enrollment, attendance — chờ BE xác nhận.
 */
export function useNotificationsDropdown(enabled: boolean) {
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: QUERY_KEYS.NOTIFICATIONS.list(LIMIT),
    queryFn: () => getNotifications({ limit: LIMIT }),
    enabled,
  });

  const items = q.data ? parseNotificationsList(q.data) : [];
  const unreadCount = q.data ? parseUnreadCount(q.data, items) : 0;

  const markAll = useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onMutate: async () => {
      const key = QUERY_KEYS.NOTIFICATIONS.list(LIMIT);
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData(key);
      qc.setQueryData(key, patchNotificationsMarkAllRead(prev));
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      const key = QUERY_KEYS.NOTIFICATIONS.list(LIMIT);
      if (ctx && 'prev' in ctx && ctx.prev !== undefined) qc.setQueryData(key, ctx.prev);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    items,
    unreadCount,
    isLoading: q.isLoading,
    refetch: q.refetch,
    markAllRead: markAll.mutateAsync,
    isMarkingAll: markAll.isPending,
  };
}
