import clsx from 'clsx';
import { ENROLLMENT_STATUS, SESSION_STATUS, COVER_STATUS } from '@/shared/constants/statuses';

type EnrollmentStatus = (typeof ENROLLMENT_STATUS)[keyof typeof ENROLLMENT_STATUS];
type SessionStatus = (typeof SESSION_STATUS)[keyof typeof SESSION_STATUS];
type CoverStatus = (typeof COVER_STATUS)[keyof typeof COVER_STATUS];

const ENROLLMENT_STYLES: Record<string, string> = {
  [ENROLLMENT_STATUS.pending]: 'bg-gray-100 text-gray-800 border-gray-200',
  [ENROLLMENT_STATUS.trial]: 'bg-blue-100 text-blue-800 border-blue-200',
  [ENROLLMENT_STATUS.active]: 'bg-green-100 text-green-800 border-green-200',
  [ENROLLMENT_STATUS.paused]: 'bg-amber-100 text-amber-900 border-amber-200',
  [ENROLLMENT_STATUS.transferred]: 'bg-purple-100 text-purple-800 border-purple-200',
  [ENROLLMENT_STATUS.dropped]: 'bg-red-100 text-red-800 border-red-200',
  [ENROLLMENT_STATUS.completed]: 'bg-teal-100 text-teal-800 border-teal-200',
};

const ENROLLMENT_LABELS: Record<string, string> = {
  [ENROLLMENT_STATUS.pending]: 'Chờ xử lý',
  [ENROLLMENT_STATUS.trial]: 'Học thử',
  [ENROLLMENT_STATUS.active]: 'Đang học',
  [ENROLLMENT_STATUS.paused]: 'Bảo lưu',
  [ENROLLMENT_STATUS.transferred]: 'Chuyển lớp',
  [ENROLLMENT_STATUS.dropped]: 'Nghỉ',
  [ENROLLMENT_STATUS.completed]: 'Hoàn thành',
};

const SESSION_STYLES: Record<string, string> = {
  [SESSION_STATUS.pending]: 'bg-gray-100 text-gray-800 border-gray-200',
  [SESSION_STATUS.completed]: 'bg-green-100 text-green-800 border-green-200',
  [SESSION_STATUS.cancelled]: 'bg-red-100 text-red-800 border-red-200',
};

const SESSION_LABELS: Record<string, string> = {
  [SESSION_STATUS.pending]: 'Chưa dạy',
  [SESSION_STATUS.completed]: 'Đã dạy',
  [SESSION_STATUS.cancelled]: 'Đã hủy',
};

const COVER_STYLES: Record<string, string> = {
  [COVER_STATUS.pending]: 'bg-gray-100 text-gray-800 border-gray-200',
  [COVER_STATUS.confirmed]: 'bg-blue-100 text-blue-800 border-blue-200',
  [COVER_STATUS.completed]: 'bg-green-100 text-green-800 border-green-200',
  [COVER_STATUS.cancelled]: 'bg-red-100 text-red-800 border-red-200',
};

const COVER_LABELS: Record<string, string> = {
  [COVER_STATUS.pending]: 'Chờ xác nhận',
  [COVER_STATUS.confirmed]: 'Đã xác nhận',
  [COVER_STATUS.completed]: 'Hoàn thành',
  [COVER_STATUS.cancelled]: 'Đã hủy',
};

export type StatusBadgeDomain = 'enrollment' | 'session' | 'cover';

interface StatusBadgeProps {
  domain: StatusBadgeDomain;
  status: string;
  className?: string;
}

export function StatusBadge({ domain, status, className = '' }: StatusBadgeProps) {
  const styles =
    domain === 'enrollment'
      ? ENROLLMENT_STYLES
      : domain === 'session'
        ? SESSION_STYLES
        : COVER_STYLES;
  const labels =
    domain === 'enrollment'
      ? ENROLLMENT_LABELS
      : domain === 'session'
        ? SESSION_LABELS
        : COVER_LABELS;

  const style = styles[status] ?? 'bg-gray-50 text-gray-700 border-gray-200';
  const label = labels[status] ?? status;

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        style,
        className
      )}
    >
      {label}
    </span>
  );
}

export type { EnrollmentStatus, SessionStatus, CoverStatus };
