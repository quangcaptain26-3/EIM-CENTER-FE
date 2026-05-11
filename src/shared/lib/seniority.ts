import { formatDate } from '@/shared/lib/date';

/** Từ số tháng (BE) → "X năm Y tháng" / "X tháng" */
export function formatSeniorityMonths(months: number | null | undefined): string {
  if (months == null || months < 0) return '—';
  if (months < 12) return `${months} tháng`;
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (m === 0) return `${y} năm`;
  return `${y} năm ${m} tháng`;
}

/** Từ ngày vào làm → "X năm Y tháng kể từ DD/MM/YYYY" */
export function formatSenioritySinceStartDate(startDate: string | null | undefined): string {
  if (!startDate) return '—';
  const d = new Date(startDate);
  if (Number.isNaN(d.getTime())) return '—';
  const now = new Date();
  let months =
    (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
  if (now.getDate() < d.getDate()) months -= 1;
  months = Math.max(0, months);
  return `${formatSeniorityMonths(months)} kể từ ${formatDate(startDate)}`;
}
