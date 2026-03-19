/**
 * notifications.page.tsx
 * Trang hiển thị danh sách toàn bộ thông báo của người dùng.
 */

import { useState } from 'react';
import { PageShell } from '@/presentation/components/common/page-shell';
import { useNotifications, useUnreadNotificationCount } from '@/presentation/hooks/system/use-notifications';
import { useMarkAllNotificationsRead, useMarkNotificationRead } from '@/presentation/hooks/system/use-notification-mutations';
import { NotificationItem } from '@/presentation/components/system/notification-item';
import { Button } from '@/shared/ui/button';
import { CheckCheck, Inbox } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

const LIMIT = 15;

export const NotificationsPage = () => {
  const [isReadFilter, setIsReadFilter] = useState<boolean | undefined>(undefined);
  const [page, setPage] = useState(1);

  // Hooks & Data
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const { data, isLoading } = useNotifications({ 
    isRead: isReadFilter === undefined ? undefined : String(isReadFilter),
    limit: LIMIT,
    offset: (page - 1) * LIMIT
  });

  const markAllReadMutation = useMarkAllNotificationsRead();
  const markReadMutation = useMarkNotificationRead();

  const handleFilterChange = (filter: boolean | undefined) => {
    setIsReadFilter(filter);
    setPage(1); // Reset về trang đầu
  };

  const totalPages = Math.ceil(((data as any)?.total || 0) / LIMIT);

  return (
    <PageShell 
      title="Thông báo"
      description="Xem và quản lý các thông báo quan trọng từ hệ thống."
      actions={
        <Button 
          variant="secondary" 
          size="sm"
          onClick={() => markAllReadMutation.mutate()}
          loading={markAllReadMutation.isPending}
          disabled={unreadCount === 0 || markAllReadMutation.isPending}
          className="flex items-center gap-1.5"
        >
          <CheckCheck className="h-4 w-4" />
          Đánh dấu tất cả đã đọc
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200">
          <button
            onClick={() => handleFilterChange(undefined)}
            className={cn(
              "px-6 py-3 text-sm font-bold transition-all relative",
              isReadFilter === undefined ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
            )}
          >
            Tất cả
            {isReadFilter === undefined && (
              <div className="absolute bottom-0 left-0 h-1 w-full bg-indigo-600 rounded-t-full" />
            )}
          </button>
          <button
            onClick={() => handleFilterChange(false)}
            className={cn(
              "px-6 py-3 text-sm font-bold transition-all relative flex items-center gap-2",
              isReadFilter === false ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
            )}
          >
            Chưa đọc
            {unreadCount > 0 && (
              <span className="h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full bg-rose-600 text-[10px] text-white font-black">
                {unreadCount}
              </span>
            )}
            {isReadFilter === false && (
              <div className="absolute bottom-0 left-0 h-1 w-full bg-indigo-600 rounded-t-full" />
            )}
          </button>
        </div>

        {/* List Content */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mb-4" />
              <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">Đang tải thông báo...</p>
            </div>
          ) : data?.items && data.items.length > 0 ? (
            <>
              <div className="divide-y divide-slate-100">
                {data.items.map((n: any) => (
                  <NotificationItem 
                    key={n.id} 
                    notification={n} 
                    onRead={(id) => markReadMutation.mutate(id)} 
                  />
                ))}
              </div>

              {/* Pagination Footer */}
              {((data as any).total || 0) > LIMIT && (
                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                    Trang {page} / {totalPages} (Tổng {(data as any).total} thông báo)
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      disabled={page <= 1}
                      onClick={() => setPage(page - 1)}
                    >
                      Trước
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage(page + 1)}
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 px-5 text-center">
              <div className="rounded-full bg-slate-50 p-6 mb-6">
                <Inbox className="h-16 w-16 text-slate-200" strokeWidth={1} />
              </div>
              <h4 className="text-lg font-bold text-slate-700 mb-2">Hòm thư trống</h4>
              <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
                Bạn không có thông báo nào {isReadFilter === false ? "chưa đọc " : ""}vào lúc này.
              </p>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
};

export default NotificationsPage;
