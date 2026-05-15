/**
 * UUID 8-4-4-4-12 (PostgreSQL / seed dev).
 * Không ép RFC variant/version — seed dùng nhóm `0000-0000-…`.
 */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string | null | undefined): boolean {
  const s = value?.trim();
  return Boolean(s && UUID_RE.test(s));
}

/** Lấy giá trị UUID hợp lệ đầu tiên trong danh sách ứng viên. */
export function pickUuid(...candidates: (string | null | undefined)[]): string {
  for (const c of candidates) {
    const s = c?.trim();
    if (s && UUID_RE.test(s)) return s;
  }
  return '';
}
