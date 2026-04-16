import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import type { EnrollmentStatus } from '@/shared/types/student.type';
import type { RoleCode } from '@/shared/types/auth.type';
import { SESSION_STATUS } from '@/shared/constants/statuses';

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
  purple: 'bg-violet-500/10 text-violet-600 border-violet-200 dark:text-violet-300 dark:border-violet-500/25',
  teal: 'bg-cyan-500/10 text-cyan-600 border-cyan-200 dark:text-cyan-300 dark:border-cyan-500/25',
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

const enrollmentStyles: Record<
  EnrollmentStatus,
  { label: string; tone: string }
> = {
  pending: {
    label: 'Chờ xử lý',
    tone: 'bg-[var(--badge-pending-bg)] text-[var(--badge-pending-text)] border-[var(--border-subtle)]',
  },
  trial: {
    label: 'Học thử',
    tone: 'bg-[var(--badge-trial-bg)] text-[var(--badge-trial-text)] border-[var(--border-subtle)]',
  },
  active: {
    label: 'Đang học',
    tone: 'bg-[var(--badge-active-bg)] text-[var(--badge-active-text)] border-[var(--success-border)]',
  },
  paused: {
    label: 'Tạm dừng',
    tone: 'bg-[var(--badge-paused-bg)] text-[var(--badge-paused-text)] border-[var(--warning-border)]',
  },
  transferred: {
    label: 'Đã chuyển lớp',
    tone:
      'bg-[var(--badge-transferred-bg)] text-[var(--badge-transferred-text)] border-[var(--border-subtle)]',
  },
  dropped: {
    label: 'Đã nghỉ',
    tone: 'bg-[var(--badge-dropped-bg)] text-[var(--badge-dropped-text)] border-[var(--danger-border)]',
  },
  completed: {
    label: 'Hoàn thành',
    tone: 'bg-[var(--badge-completed-bg)] text-[var(--badge-completed-text)] border-[var(--info-border)]',
  },
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
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border border-[var(--border-default)] bg-[var(--bg-subtle)] px-2 py-0.5 text-xs font-medium text-[var(--text-muted)]',
          className,
        )}
      >
        {dot ? (
          <span className="size-1.5 shrink-0 rounded-full bg-[var(--text-muted)]" aria-hidden />
        ) : null}
        Chưa ghi danh
      </span>
    );
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium',
        cfg.tone,
        className,
      )}
    >
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
    tone: 'border-[var(--border-subtle)] bg-violet-500/10 text-[var(--role-admin)]',
    dot: 'bg-[var(--role-admin)]',
  },
  ACADEMIC: {
    label: 'Học vụ',
    tone: 'border-[var(--border-subtle)] bg-[var(--accent-subtle)] text-[var(--role-academic)]',
    dot: 'bg-[var(--role-academic)]',
  },
  ACCOUNTANT: {
    label: 'Kế toán',
    tone: 'border-[var(--border-subtle)] bg-amber-500/10 text-[var(--role-accountant)]',
    dot: 'bg-[var(--role-accountant)]',
  },
  TEACHER: {
    label: 'Giáo viên',
    tone: 'border-[var(--border-subtle)] bg-cyan-500/10 text-[var(--role-teacher)]',
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
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium',
        cfg.tone,
        className,
      )}
    >
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
