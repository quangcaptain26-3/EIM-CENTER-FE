import type { ApiResponse } from '@/shared/types/api.type';
import type { NotificationItem } from '@/shared/types/notification.type';

function unwrapBody(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object') return raw;
  const r = raw as ApiResponse<unknown>;
  return r.data !== undefined ? r.data : raw;
}

export function parseNotificationsList(raw: unknown): NotificationItem[] {
  const inner = unwrapBody(raw);
  const arr = Array.isArray(inner) ? inner : (inner as { data?: unknown })?.data;
  if (!Array.isArray(arr)) return [];
  return arr
    .map((row: Record<string, unknown>) => ({
      id: String(row.id ?? row._id ?? ''),
      type: String(row.type ?? 'info'),
      message: String(row.message ?? row.body ?? row.title ?? ''),
      read: Boolean(row.read ?? row.isRead),
      createdAt: String(row.createdAt ?? row.created_at ?? ''),
    }))
    .filter((n) => n.id);
}

/** Optimistic: đánh dấu đã đọc toàn bộ (clone JSON an toàn) */
export function patchNotificationsMarkAllRead(raw: unknown): unknown {
  try {
    const clone = JSON.parse(JSON.stringify(raw)) as Record<string, unknown>;
    const mark = (arr: Record<string, unknown>[]) =>
      arr.map((x) => ({ ...x, read: true, isRead: true }));

    if (Array.isArray(clone)) {
      return mark(clone as Record<string, unknown>[]);
    }
    const data = clone.data;
    if (Array.isArray(data)) {
      clone.data = mark(data as Record<string, unknown>[]);
    }
    const items = clone.items;
    if (Array.isArray(items)) {
      clone.items = mark(items as Record<string, unknown>[]);
    }
    if (typeof clone.unreadCount === 'number') clone.unreadCount = 0;
    const inner = clone.data;
    if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
      const o = inner as Record<string, unknown>;
      if (Array.isArray(o.data)) o.data = mark(o.data as Record<string, unknown>[]);
      if (typeof o.unreadCount === 'number') o.unreadCount = 0;
    }
    return clone;
  } catch {
    return raw;
  }
}

export function parseUnreadCount(raw: unknown, items: NotificationItem[]): number {
  const inner = unwrapBody(raw);
  if (inner && typeof inner === 'object' && 'unreadCount' in inner) {
    const n = Number((inner as { unreadCount: unknown }).unreadCount);
    if (Number.isFinite(n)) return n;
  }
  return items.filter((i) => !i.read).length;
}
