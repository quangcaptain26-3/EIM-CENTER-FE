import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

export type KpiAccent = 'brand' | 'violet' | 'emerald' | 'amber';

const ACCENT_TOP: Record<KpiAccent, string> = {
  brand: 'border-t-brand-500/50',
  violet: 'border-t-violet-500/50',
  emerald: 'border-t-emerald-500/50',
  amber: 'border-t-amber-500/50',
};

export interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: number; label: string };
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
  href?: string;
  isLoading?: boolean;
  alert?: string;
  /** Màu dòng cảnh báo (vd. học phí còn lại) */
  alertClassName?: string;
  accent: KpiAccent;
  className?: string;
  style?: React.CSSProperties;
}

function SkeletonBlock() {
  return <div className="h-9 w-24 rounded-md bg-[var(--bg-subtle)] animate-shimmer" />;
}

export function KpiCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  iconBg,
  iconColor,
  href,
  isLoading,
  alert,
  alertClassName,
  accent,
  className,
  style,
}: KpiCardProps) {
  const inner = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className={cn('flex size-11 shrink-0 items-center justify-center rounded-full', iconBg)}>
          <span className={cn(iconColor, '[&_svg]:size-5')}>{icon}</span>
        </div>
        {trend != null && Number.isFinite(trend.value) ? (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-xs font-medium',
              trend.value >= 0
                ? 'text-emerald-500 dark:text-emerald-400'
                : 'text-red-600 dark:text-red-400',
            )}
          >
            {trend.value >= 0 ? (
              <TrendingUp className="size-3.5" strokeWidth={1.5} />
            ) : (
              <TrendingDown className="size-3.5" strokeWidth={1.5} />
            )}
            {trend.value >= 0 ? '+' : ''}
            {trend.value.toFixed(1)}%
          </span>
        ) : null}
      </div>
      <div className="mt-3 space-y-1">
        <p className="text-sm text-[var(--text-muted)]">{title}</p>
        {isLoading ? (
          <SkeletonBlock />
        ) : (
          <p className="font-display text-3xl font-bold tabular-nums text-[var(--text-primary)]">
            {value}
          </p>
        )}
        {subtitle ? (
          <p className="text-xs text-[var(--text-muted)]">{subtitle}</p>
        ) : null}
        {alert ? (
          <p className={cn('text-xs font-medium', alertClassName ?? 'text-amber-600 dark:text-amber-400')}>
            {alert}
          </p>
        ) : null}
        {trend?.label ? (
          <p className="text-[11px] text-[var(--text-muted)]">{trend.label}</p>
        ) : null}
      </div>
    </>
  );

  const cardClass = cn(
    'rounded-2xl border border-[var(--border-default)] border-t-2 bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-card)]',
    ACCENT_TOP[accent],
    'transition-all duration-200',
    'hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-md)]',
    href && 'cursor-pointer',
    className,
  );

  if (href && !isLoading) {
    return (
      <Link to={href} className={cardClass} style={style}>
        {inner}
      </Link>
    );
  }

  return (
    <div className={cardClass} style={style}>
      {inner}
    </div>
  );
}
