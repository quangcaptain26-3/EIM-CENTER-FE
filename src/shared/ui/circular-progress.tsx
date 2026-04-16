import { useMemo } from 'react';
import { cn } from '@/shared/lib/cn';

function strokeClass(percent: number): string {
  if (percent >= 100) return 'stroke-brand-500';
  if (percent >= 75) return 'stroke-green-500';
  if (percent >= 50) return 'stroke-amber-500';
  return 'stroke-blue-500';
}

export interface CircularProgressProps {
  attended: number;
  total: number;
  /** Đường kính SVG px */
  size?: number;
  className?: string;
}

export function CircularProgress({
  attended,
  total,
  size = 64,
  className,
}: CircularProgressProps) {
  const strokeWidth = 4;
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;

  const percent = useMemo(() => {
    if (total <= 0) return 0;
    return Math.min(100, Math.max(0, (attended / total) * 100));
  }, [attended, total]);

  const offset = c * (1 - percent / 100);
  const stroke = strokeClass(percent);

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        aria-hidden
      >
        <circle
          className="fill-none stroke-[var(--border-strong)]"
          strokeWidth={strokeWidth}
          cx={size / 2}
          cy={size / 2}
          r={r}
        />
        <circle
          className={cn('fill-none transition-[stroke-dashoffset] duration-500 ease-out', stroke)}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          cx={size / 2}
          cy={size / 2}
          r={r}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-xs font-semibold tabular-nums text-[var(--text-primary)]">
          {attended}/{total}
        </span>
        <span className="text-[10px] text-[var(--text-muted)]">buổi</span>
      </div>
    </div>
  );
}
