import { WEEKDAY_LABELS } from '../constants/config';

/** Ngày "hôm nay" theo lịch VN (UTC+7), định dạng YYYY-MM-DD — dùng so sánh với sessionDate (DATE). */
export function todayYmdUtc7(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/**
 * Map BE `schedule_days` SMALLINT[] → "Thứ 2, Thứ 4" — fmt.scheduleDays / chuẩn EIM.
 * (Export name `scheduleDays` theo contract; `parseScheduleDays` giữ tương thích.)
 */
export function scheduleDays(days: number[] | null | undefined): string {
  if (!days || days.length === 0) return '';
  const sorted = [...new Set(days)].sort((a, b) => a - b);
  return sorted
    .map((d) => WEEKDAY_LABELS[d] ?? (d === 8 ? 'Chủ nhật' : `Thứ ${d}`))
    .join(', ');
}

/** TIMESTAMPTZ → hiển thị giờ theo UTC+7 */
export function formatDateTimeUtc7(date: string | Date | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function formatDate(date: string | Date): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/** VD: "Thứ hai, 11/04/2026" */
export function formatDateWithWeekday(date: string | Date): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatMonth(month: number, year: number): string {
  return `Tháng ${month}/${year}`;
}

export function parseScheduleDays(days: number[]): string {
  return scheduleDays(days);
}

export function isToday(date: string | Date): boolean {
  if (!date) return false;
  const today = new Date();
  const d = new Date(date);
  return (
    today.getDate() === d.getDate() &&
    today.getMonth() === d.getMonth() &&
    today.getFullYear() === d.getFullYear()
  );
}

/** Hôm nay theo lịch Asia/Ho_Chi_Minh (UTC+7) — dùng cho điểm danh đúng ngày học */
export function isTodayUtc7(isoDate: string | Date): boolean {
  if (!isoDate) return false;
  const ymd =
    typeof isoDate === 'string'
      ? isoDate.slice(0, 10)
      : isoDate.toISOString().slice(0, 10);
  const todayVn = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  return ymd === todayVn;
}
