import { formatVnd } from '@/shared/utils/format-vnd';
import { cn } from '@/shared/lib/cn';

interface DebtIndicatorProps {
  tuitionFee: number;
  totalPaid: number;
  debt: number;
  className?: string;
  compact?: boolean;
}

/** 3 cột: Học phí | Đã đóng | Còn nợ — dùng tab Tài chính / form phiếu thu / payment-status */
export function DebtIndicator({ tuitionFee, totalPaid, debt, className = '', compact }: DebtIndicatorProps) {
  const debtColor =
    debt > 0 ? 'text-red-400' : debt === 0 ? 'text-green-400' : 'text-sky-400';

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 sm:grid-cols-3',
        compact && 'p-3 text-sm',
        className,
      )}
    >
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">Học phí</p>
        <p className="mt-1 font-semibold text-[var(--text-primary)]">{formatVnd(tuitionFee)}</p>
      </div>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">Đã đóng</p>
        <p className="mt-1 font-semibold text-[var(--text-primary)]">{formatVnd(totalPaid)}</p>
      </div>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">Còn nợ</p>
        <p className={cn('mt-1 font-semibold', debtColor)}>
          {debt === 0 ? (
            <>
              Đã đủ <span className="text-green-400">✓</span>
            </>
          ) : (
            formatVnd(Math.abs(debt))
          )}
          {debt < 0 ? <span className="ml-1 text-xs font-normal text-sky-400/90">(dư)</span> : null}
        </p>
      </div>
    </div>
  );
}
