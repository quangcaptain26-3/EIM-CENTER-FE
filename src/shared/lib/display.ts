/** Giá trị hiển thị khi null/empty — italic slate để phân biệt dữ liệu thật */
export const EMPTY_PLACEHOLDER = 'Chưa cập nhật';

export function isEmptyDisplay(v: unknown): boolean {
  if (v === null || v === undefined) return true;
  if (typeof v === 'string') return v.trim() === '';
  return false;
}

/** Chuỗi hoặc placeholder (không dùng "—" mù quáng) */
export function displayText(v: unknown, empty: string = EMPTY_PLACEHOLDER): string {
  if (isEmptyDisplay(v)) return empty;
  if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  return String(v).trim();
}

export function placeholderClassName(empty: boolean): string {
  return empty ? 'text-slate-400 italic dark:text-[var(--text-muted)]' : '';
}
