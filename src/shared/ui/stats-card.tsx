import type { ReactNode } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

export interface StatsCardProps {
  label: string;
  value: string | number;
  /** Phần trăm thay đổi — dương = xanh, âm = đỏ */
  trendPercent?: number;
  icon?: ReactNode;
  /** Nền icon bên phải */
  iconTintClassName?: string;
  className?: string;
}

export function StatsCard({
  label,
  value,
  trendPercent,
  icon,
  iconTintClassName = 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400',
  className,
}: StatsCardProps) {
  const positive = trendPercent != null && trendPercent >= 0;
  const showTrend = trendPercent != null && Number.isFinite(trendPercent);

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 dark:border-[var(--border-subtle)] dark:bg-[var(--bg-base)]',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <p className="text-sm font-medium text-slate-500 dark:text-[var(--text-secondary)]">{label}</p>
          <p className="font-display text-[32px] font-semibold leading-none tracking-tight text-slate-900 dark:text-[var(--text-primary)]">
            {value}
          </p>
          {showTrend ? (
            <div
              className={cn(
                'inline-flex items-center gap-1 text-sm font-medium',
                positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400',
              )}
            >
              {positive ? (
                <TrendingUp className="size-4 shrink-0" strokeWidth={1.5} />
              ) : (
                <TrendingDown className="size-4 shrink-0" strokeWidth={1.5} />
              )}
              <span>
                {positive ? '+' : ''}
                {trendPercent.toFixed(1)}%
              </span>
            </div>
          ) : null}
        </div>
        {icon ? (
          <div
            className={cn(
              'flex size-12 shrink-0 items-center justify-center rounded-xl',
              iconTintClassName,
            )}
          >
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}
