export function formatVnd(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Hiển thị số với dấu chấm nghìn (VD: 1.000.000) — không kèm đơn vị */
export function formatAmountDots(n: number): string {
  if (!Number.isFinite(n) || n === 0) return '';
  return new Intl.NumberFormat('vi-VN').format(Math.round(n));
}

export function parseAmountDots(s: string): number {
  const n = parseInt(s.replace(/\D/g, ''), 10);
  return Number.isFinite(n) ? n : 0;
}

/** Rút gọn cho trục Y / KPI (vd: 12,5 tr, 1,2 B) */
export function currencyShort(amount: number): string {
  if (!Number.isFinite(amount)) return '—';
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (abs >= 1_000_000_000) {
    return `${sign}${(abs / 1_000_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} B`;
  }
  if (abs >= 1_000_000) {
    return `${sign}${(abs / 1_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tr`;
  }
  if (abs >= 1000) {
    return `${sign}${(abs / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} k`;
  }
  return formatVnd(amount);
}
