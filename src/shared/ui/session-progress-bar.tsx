import { useMemo } from 'react';
import { cn } from '@/shared/lib/cn';

/** Fill theo %: <40 xanh, 40–75 brand, 75–99 emerald, 100 emerald đậm */
function barFillClass(percent: number): string {
  if (percent >= 100) return 'bg-emerald-600';
  if (percent >= 75) return 'bg-emerald-500';
  if (percent >= 40) return 'bg-brand-500';
  return 'bg-blue-500';
}

export interface SessionProgressBarProps {
  completed: number;
  /** Tổng buổi — mặc định 24 */
  total?: number;
  className?: string;
}

export function SessionProgressBar({
  completed,
  total = 24,
  className,
}: SessionProgressBarProps) {
  const pct = useMemo(() => {
    if (total <= 0) return 0;
    return Math.min(100, Math.max(0, (completed / total) * 100));
  }, [completed, total]);

  const fill = barFillClass(pct);

  return (
    <div className={cn('w-full space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-[var(--text-muted)]">Tiến độ buổi học</span>
        <span className="font-medium tabular-nums text-[var(--text-primary)]">
          {completed}/{total} buổi
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--bg-subtle)]">
        <div
          className={cn('h-full rounded-full transition-[width] duration-500 ease-out', fill)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
