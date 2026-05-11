/**
 * BE có hai kiểu (sau khi axios interceptor trả `response.data`):
 * - Envelope: `{ data: T }` (login, /me, tạo/sửa một bản ghi) → trả `T`.
 * - Phân trang: `{ data: T[], total, ... }` hoặc `{ data, meta }` → **giữ nguyên** object,
 *   không bóc mất `total` / `meta` (nếu không mọi trang list sẽ nhận nhầm chỉ mảng → parser trả rỗng).
 */
export function unwrapApiData<T>(raw: unknown): T {
  if (raw === null || typeof raw !== 'object') {
    return raw as T;
  }
  const r = raw as Record<string, unknown>;

  const isPagedPayload =
    'meta' in r ||
    (Array.isArray(r.data) && ('total' in r || 'totalPages' in r));

  if (isPagedPayload) {
    return raw as T;
  }

  if ('data' in r && r.data !== undefined) {
    return r.data as T;
  }

  return raw as T;
}
