import { scheduleDays as scheduleDaysFmt } from './date';

/** Định dạng tiền tệ gọn (VND) cho bảng / badge */
export function currencyShort(amount: number | null | undefined): string {
  if (amount == null || Number.isNaN(amount)) return '—';
  const n = amount;
  if (n >= 1_000_000_000) {
    const v = n / 1_000_000_000;
    return `${v >= 10 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, '')} tỷ`;
  }
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    return `${v >= 10 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, '')} tr`;
  }
  if (n >= 1_000) {
    return `${Math.round(n / 1_000)}k`;
  }
  return `${new Intl.NumberFormat('vi-VN').format(n)} ₫`;
}

export const fmt = { currencyShort, scheduleDays: scheduleDaysFmt };
