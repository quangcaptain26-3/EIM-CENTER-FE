import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import type { EnrollmentStatus } from '@/shared/types/student.type';
import type { RoleCode } from '@/shared/types/auth.type';
import { SESSION_STATUS } from '@/shared/constants/statuses';
import {
  BADGE_BASE,
  ENROLLMENT_BADGE_CLASS,
  ENROLLMENT_BADGE_FALLBACK,
} from '@/shared/ui/badge-tones';

export type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'purple'
  | 'teal'
  | 'brand';

export interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  className?: string;
}

const variantClass: Record<BadgeVariant, string> = {
  default:
    'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border-subtle)]',
  success:
    'bg-[var(--success-bg)] text-[var(--success-text)] border-[var(--success-border)]',
  warning:
    'bg-[var(--warning-bg)] text-[var(--warning-text)] border-[var(--warning-border)]',
  danger:
    'bg-[var(--danger-bg)] text-[var(--danger-text)] border-[var(--danger-border)]',
  info: 'bg-[var(--info-bg)] text-[var(--info-text)] border-[var(--info-border)]',
  purple:
    'bg-[var(--badge-transferred-bg)] text-[var(--badge-transferred-text)] border-[var(--badge-transferred-border)]',
  teal: 'bg-[var(--badge-completed-bg)] text-[var(--badge-completed-text)] border-[var(--badge-completed-border)]',
  brand:
    'bg-[var(--accent-subtle)] text-[var(--accent-text)] border-[var(--accent-border)]',
};

const dotClass: Record<BadgeVariant, string> = {
  default: 'bg-[var(--text-muted)]',
  success: 'bg-[var(--success-text)]',
  warning: 'bg-[var(--warning-text)]',
  danger: 'bg-[var(--danger-text)]',
  info: 'bg-[var(--info-text)]',
  purple: 'bg-violet-500',
  teal: 'bg-cyan-500',
  brand: 'bg-[var(--accent)]',
};

export function Badge({ children, variant = 'default', dot = false, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium',
        variantClass[variant],
        className,
      )}
    >
      {dot ? (
        <span className={cn('size-1.5 shrink-0 rounded-full', dotClass[variant])} aria-hidden />
      ) : null}
      {children}
    </span>
  );
}

const enrollmentStyles: Record<EnrollmentStatus, { label: string; tone: string }> = {
  reserved: { label: 'Giữ chỗ', tone: ENROLLMENT_BADGE_CLASS.reserved },
  pending: { label: 'Chờ xử lý', tone: ENROLLMENT_BADGE_CLASS.pending },
  trial: { label: 'Học thử', tone: ENROLLMENT_BADGE_CLASS.trial },
  active: { label: 'Đang học', tone: ENROLLMENT_BADGE_CLASS.active },
  paused: { label: 'Tạm dừng', tone: ENROLLMENT_BADGE_CLASS.paused },
  transferred: { label: 'Đã chuyển lớp', tone: ENROLLMENT_BADGE_CLASS.transferred },
  dropped: { label: 'Đã nghỉ', tone: ENROLLMENT_BADGE_CLASS.dropped },
  completed: { label: 'Hoàn thành', tone: ENROLLMENT_BADGE_CLASS.completed },
};

export interface EnrollmentBadgeProps {
  status: string | null | undefined;
  className?: string;
  dot?: boolean;
}

export function EnrollmentBadge({ status, className, dot }: EnrollmentBadgeProps) {
  const key = (status ?? '').toLowerCase() as EnrollmentStatus;
  const cfg = enrollmentStyles[key];
  if (!cfg) {
    return (
      <span className={cn(BADGE_BASE, ENROLLMENT_BADGE_FALLBACK, className)}>
        {dot ? (
          <span className="size-1.5 shrink-0 rounded-full bg-[var(--text-muted)]" aria-hidden />
        ) : null}
        Chưa ghi danh
      </span>
    );
  }
  return (
    <span className={cn(BADGE_BASE, cfg.tone, className)}>
      {dot ? (
        <span
          className="size-1.5 shrink-0 rounded-full bg-current opacity-80"
          aria-hidden
        />
      ) : null}
      {cfg.label}
    </span>
  );
}

const roleTone: Record<RoleCode, { label: string; tone: string; dot: string }> = {
  ADMIN: {
    label: 'Giám đốc',
    tone: 'bg-[var(--badge-transferred-bg)] text-[var(--badge-transferred-text)] border-[var(--badge-transferred-border)]',
    dot: 'bg-[var(--role-admin)]',
  },
  ACADEMIC: {
    label: 'Học vụ',
    tone: 'bg-[var(--badge-trial-bg)] text-[var(--badge-trial-text)] border-[var(--badge-trial-border)]',
    dot: 'bg-[var(--role-academic)]',
  },
  ACCOUNTANT: {
    label: 'Kế toán',
    tone: 'bg-[var(--badge-paused-bg)] text-[var(--badge-paused-text)] border-[var(--badge-paused-border)]',
    dot: 'bg-[var(--role-accountant)]',
  },
  TEACHER: {
    label: 'Giáo viên',
    tone: 'bg-[var(--badge-completed-bg)] text-[var(--badge-completed-text)] border-[var(--badge-completed-border)]',
    dot: 'bg-[var(--role-teacher)]',
  },
};

export interface RoleBadgeProps {
  /** Mã vai trò (ADMIN | …) hoặc object BE `{ code }` */
  role: string | { code: string } | null | undefined;
  className?: string;
  dot?: boolean;
}

function roleCodeLabel(role: RoleBadgeProps['role']): string {
  if (role == null) return '';
  if (typeof role === 'string') return role.trim();
  if (typeof role === 'object' && role !== null && typeof role.code === 'string') {
    return role.code.trim();
  }
  return '';
}

export function RoleBadge({ role, className, dot }: RoleBadgeProps) {
  const code = roleCodeLabel(role) as RoleCode;
  const cfg = roleTone[code];
  if (!cfg) {
    return (
      <Badge variant="default" className={className} dot={dot}>
        {code || 'Không rõ'}
      </Badge>
    );
  }
  return (
    <span className={cn(BADGE_BASE, cfg.tone, className)}>
      {dot ? (
        <span className={cn('size-1.5 shrink-0 rounded-full', cfg.dot)} aria-hidden />
      ) : null}
      {cfg.label}
    </span>
  );
}

export type SessionBadgeStatus = (typeof SESSION_STATUS)[keyof typeof SESSION_STATUS];

const sessionConfig: Record<
  SessionBadgeStatus,
  { label: string; variant: BadgeVariant }
> = {
  pending: { label: 'Chưa diễn ra', variant: 'warning' },
  completed: { label: 'Đã hoàn thành', variant: 'success' },
  cancelled: { label: 'Đã hủy', variant: 'danger' },
};

export interface SessionBadgeProps {
  status: string | null | undefined;
  className?: string;
  dot?: boolean;
}

export function SessionBadge({ status, className, dot }: SessionBadgeProps) {
  const key = (status ?? '').toLowerCase() as SessionBadgeStatus;
  const cfg = sessionConfig[key] ?? {
    label: status?.trim() || 'Không rõ',
    variant: 'default' as const,
  };
  return (
    <Badge variant={cfg.variant} className={className} dot={dot}>
      {cfg.label}
    </Badge>
  );
}
