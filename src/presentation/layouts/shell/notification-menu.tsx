import { useRef, useState } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import {
  Bell,
  CheckCheck,
  Info,
  Loader2,
  Megaphone,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';
import { useNotificationsDropdown } from '@/presentation/hooks/use-notifications';
import { useClickOutside } from '@/shared/hooks/use-click-outside';
import type { NotificationItem } from '@/shared/types/notification.type';

dayjs.extend(relativeTime);
dayjs.locale('vi');

function TypeIcon({ type }: { type: string }) {
  const t = type.toLowerCase();
  if (t.includes('alert') || t.includes('warn')) {
    return <AlertCircle className="size-4 text-amber-500" strokeWidth={1.5} />;
  }
  if (t.includes('announce') || t.includes('news')) {
    return <Megaphone className="size-4 text-brand-600" strokeWidth={1.5} />;
  }
  return <Info className="size-4 text-blue-600" strokeWidth={1.5} />;
}

function NotificationRow({ item }: { item: NotificationItem }) {
  const rel = item.createdAt ? dayjs(item.createdAt).fromNow() : '';
  return (
    <div
      className={cn(
        'flex gap-3 border-b border-slate-100 px-3 py-2.5 last:border-0 dark:border-[var(--border-subtle)]',
        !item.read && 'bg-blue-50/80 dark:bg-blue-950/20',
      )}
    >
      <div className="mt-0.5 shrink-0">
        <TypeIcon type={item.type} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-slate-800 dark:text-[var(--text-primary)]">{item.message}</p>
        {rel ? <p className="mt-0.5 text-xs text-slate-500 dark:text-[var(--text-muted)]">{rel}</p> : null}
      </div>
    </div>
  );
}

export function NotificationMenu() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { items, unreadCount, isLoading, markAllRead, isMarkingAll } = useNotificationsDropdown(true);

  useClickOutside(wrapRef, open ? () => setOpen(false) : null, open);

  const handleMarkAll = async () => {
    try {
      await markAllRead();
      toast.success('Đã đánh dấu đã đọc');
    } catch {
      toast.error('Không cập nhật được thông báo');
    }
  };

  return (
    <div ref={wrapRef} className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="relative text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-[var(--text-secondary)] dark:hover:bg-[var(--bg-elevated)] dark:hover:text-[var(--text-primary)]"
        aria-label="Thông báo"
        onClick={() => setOpen((o) => !o)}
      >
        <Bell className="size-[18px]" strokeWidth={1.5} />
        {unreadCount > 0 ? (
          <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </Button>

      {open ? (
        <div
          className={cn(
            'absolute right-0 top-full z-120 mt-2 w-[min(100vw-2rem,22rem)] overflow-hidden',
            'rounded-xl border border-slate-200 bg-white shadow-lg animate-scale-in dark:border-[var(--border-subtle)] dark:bg-[var(--bg-surface)]',
          )}
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2 dark:border-[var(--border-subtle)]">
            <span className="text-sm font-medium text-slate-900 dark:text-[var(--text-primary)]">Thông báo</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1 text-xs text-blue-600 hover:bg-slate-100 hover:text-blue-700 dark:hover:bg-[var(--bg-elevated)]"
              disabled={isMarkingAll || items.length === 0}
              onClick={() => void handleMarkAll()}
            >
              {isMarkingAll ? (
                <Loader2 className="size-3.5 animate-spin" strokeWidth={1.5} />
              ) : (
                <CheckCheck className="size-3.5" strokeWidth={1.5} />
              )}
              Đánh dấu tất cả đã đọc
            </Button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-shimmer h-16 w-full max-w-[200px] rounded-lg" />
              </div>
            ) : items.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-slate-500 dark:text-[var(--text-muted)]">
                Chưa có thông báo
              </p>
            ) : (
              items.map((item) => <NotificationRow key={item.id} item={item} />)
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
