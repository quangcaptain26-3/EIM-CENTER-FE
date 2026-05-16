import clsx from 'clsx';
import { ENROLLMENT_STATUS, SESSION_STATUS, COVER_STATUS } from '@/shared/constants/statuses';
import {
  BADGE_BASE,
  COVER_BADGE_CLASS,
  ENROLLMENT_BADGE_CLASS,
  ENROLLMENT_BADGE_FALLBACK,
  SESSION_BADGE_CLASS,
} from '@/shared/ui/badge-tones';

type EnrollmentStatus = (typeof ENROLLMENT_STATUS)[keyof typeof ENROLLMENT_STATUS];
type SessionStatus = (typeof SESSION_STATUS)[keyof typeof SESSION_STATUS];
type CoverStatus = (typeof COVER_STATUS)[keyof typeof COVER_STATUS];

const ENROLLMENT_STYLES: Record<string, string> = {
  [ENROLLMENT_STATUS.reserved]: ENROLLMENT_BADGE_CLASS.reserved,
  [ENROLLMENT_STATUS.pending]: ENROLLMENT_BADGE_CLASS.pending,
  [ENROLLMENT_STATUS.trial]: ENROLLMENT_BADGE_CLASS.trial,
  [ENROLLMENT_STATUS.active]: ENROLLMENT_BADGE_CLASS.active,
  [ENROLLMENT_STATUS.paused]: ENROLLMENT_BADGE_CLASS.paused,
  [ENROLLMENT_STATUS.transferred]: ENROLLMENT_BADGE_CLASS.transferred,
  [ENROLLMENT_STATUS.dropped]: ENROLLMENT_BADGE_CLASS.dropped,
  [ENROLLMENT_STATUS.completed]: ENROLLMENT_BADGE_CLASS.completed,
};

const ENROLLMENT_LABELS: Record<string, string> = {
  [ENROLLMENT_STATUS.reserved]: 'Giữ chỗ',
  [ENROLLMENT_STATUS.pending]: 'Chờ xử lý',
  [ENROLLMENT_STATUS.trial]: 'Học thử',
  [ENROLLMENT_STATUS.active]: 'Đang học',
  [ENROLLMENT_STATUS.paused]: 'Bảo lưu',
  [ENROLLMENT_STATUS.transferred]: 'Chuyển lớp',
  [ENROLLMENT_STATUS.dropped]: 'Nghỉ',
  [ENROLLMENT_STATUS.completed]: 'Hoàn thành',
};

const SESSION_STYLES: Record<string, string> = {
  [SESSION_STATUS.pending]: SESSION_BADGE_CLASS.pending,
  [SESSION_STATUS.completed]: SESSION_BADGE_CLASS.completed,
  [SESSION_STATUS.cancelled]: SESSION_BADGE_CLASS.cancelled,
};

const SESSION_LABELS: Record<string, string> = {
  [SESSION_STATUS.pending]: 'Chưa dạy',
  [SESSION_STATUS.completed]: 'Đã dạy',
  [SESSION_STATUS.cancelled]: 'Đã hủy',
};

const COVER_STYLES: Record<string, string> = {
  [COVER_STATUS.pending]: COVER_BADGE_CLASS.pending,
  [COVER_STATUS.confirmed]: COVER_BADGE_CLASS.confirmed,
  [COVER_STATUS.completed]: COVER_BADGE_CLASS.completed,
  [COVER_STATUS.cancelled]: COVER_BADGE_CLASS.cancelled,
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

  const style = styles[status] ?? ENROLLMENT_BADGE_FALLBACK;
  const label = labels[status] ?? status;

  return <span className={clsx(BADGE_BASE, style, className)}>{label}</span>;
}

export type { EnrollmentStatus, SessionStatus, CoverStatus };
