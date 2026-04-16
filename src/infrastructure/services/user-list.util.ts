import type { ApiResponse, PagedResult } from '@/shared/types/api.type';
import type { UserResponse } from '@/shared/types/api-contract';
import type { UserListItem } from '@/shared/types/user.type';
import { mapUserResponseToListItem } from '@/shared/lib/map-user-response';

function normalizeListRow(row: unknown): UserListItem {
  if (!row || typeof row !== 'object') {
    return row as UserListItem;
  }
  const r = row as Record<string, unknown>;
  if (typeof r.roleCode === 'string') {
    return row as UserListItem;
  }
  if (r.role && typeof r.role === 'object' && r.role !== null && 'code' in r.role) {
    return mapUserResponseToListItem(row as UserResponse);
  }
  return row as UserListItem;
}

export function parseUserListResponse(raw: unknown): { users: UserListItem[]; total: number } {
  if (raw === null || raw === undefined) return { users: [], total: 0 };

  /** unwrapApiData cũ / edge: trả thẳng mảng user */
  if (Array.isArray(raw)) {
    return {
      users: raw.map((row) => normalizeListRow(row)),
      total: raw.length,
    };
  }

  if (typeof raw !== 'object') return { users: [], total: 0 };

  const top = raw as Record<string, unknown>;

  /** `{ data: User[], meta: { total, ... } }` — users API */
  if (Array.isArray(top.data) && top.meta && typeof top.meta === 'object') {
    const m = top.meta as Record<string, unknown>;
    const total = typeof m.total === 'number' ? m.total : top.data.length;
    return {
      users: top.data.map((row) => normalizeListRow(row)),
      total,
    };
  }

  /** Phản hồi dạng `{ data: User[], total }` không bọc ApiResponse */
  if (Array.isArray(top.data) && typeof top.total === 'number') {
    return {
      users: top.data.map((row) => normalizeListRow(row)),
      total: top.total,
    };
  }

  const body = raw as ApiResponse<unknown>;
  const inner = body.data;

  if (Array.isArray(inner)) {
    return {
      users: inner.map((row) => normalizeListRow(row)),
      total: inner.length,
    };
  }

  if (inner && typeof inner === 'object' && 'data' in inner) {
    const p = inner as PagedResult<UserResponse>;
    if (Array.isArray(p.data)) {
      return {
        users: p.data.map((row) => normalizeListRow(row)),
        total: p.total ?? p.data.length,
      };
    }
  }

  if (inner && typeof inner === 'object' && 'items' in inner) {
    const row = inner as { items?: unknown[]; total?: number };
    const items = row.items ?? [];
    return {
      users: items.map((x) => normalizeListRow(x)),
      total: row.total ?? items.length,
    };
  }

  return { users: [], total: 0 };
}
