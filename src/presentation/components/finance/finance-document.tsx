import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

/** Dòng thương hiệu thống nhất trên mọi phiếu in (lương, thu, …). */
export const EIM_FINANCE_BRAND = 'Trung tâm Anh ngữ EIM';

/** CSS in chung — gắn một lần trên gốc trang phiếu. */
export function FinanceDocPrintStyle() {
  return (
    <style>{`
      @media print {
        .no-print { display: none !important; }
        .finance-doc-root { color: #18181b !important; background: #fff !important; }
        .finance-doc-root table { border-color: #e4e4e7 !important; }
      }
    `}</style>
  );
}

export function FinanceDocRoot({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'finance-doc-root payroll-print-root mx-auto w-full min-w-0 max-w-3xl space-y-6 px-4 py-6 md:px-6 print:max-w-none print:bg-white print:px-6 print:py-6',
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Header: thương hiệu + tiêu đề + dòng phụ; mã phiếu canh phải (desktop). */
export function FinanceDocHeader({
  title,
  docCode,
  metaLine,
  brand = EIM_FINANCE_BRAND,
}: {
  title: string;
  docCode: string;
  metaLine?: string;
  brand?: string;
}) {
  return (
    <header className="flex w-full min-w-0 flex-wrap items-start justify-between gap-3 border-b border-[var(--border-subtle)] pb-4 print:border-zinc-300">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)] print:text-zinc-600">
          {brand}
        </p>
        <h1 className="mt-1 font-display text-xl font-semibold leading-snug text-[var(--text-primary)] print:text-zinc-900">
          {title}
        </h1>
        {metaLine ? (
          <p className="mt-1 font-mono text-sm text-[var(--text-secondary)] print:text-zinc-700">{metaLine}</p>
        ) : null}
      </div>
      {docCode ? (
        <span className="inline-flex w-fit shrink-0 rounded-full border border-brand-500/40 bg-brand-500/10 px-3 py-1 font-mono text-sm text-brand-300 print:border-zinc-300 print:bg-zinc-100 print:text-zinc-800">
          {docCode}
        </span>
      ) : null}
    </header>
  );
}

/** Nút quay lại / in — luôn bọc `no-print`. */
export function FinanceDocActions({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('no-print flex flex-wrap items-center gap-2', className)}>{children}</div>;
}

/** Dòng số liệu: nhãn trái — giá trị phải (tabular). `variant="total"` cho dòng tổng cộng. */
export function FinanceDocStatRow({
  label,
  value,
  variant = 'default',
}: {
  label: string;
  value: ReactNode;
  variant?: 'default' | 'total';
}) {
  const isTotal = variant === 'total';
  return (
    <div
      className={cn(
        'grid w-full min-w-0 grid-cols-1 items-baseline gap-x-4 gap-y-1 sm:grid-cols-[minmax(0,1fr)_auto]',
        isTotal
          ? 'border-t border-[var(--border-subtle)] pt-3 text-base print:border-zinc-300'
          : 'border-b border-[var(--border-subtle)] pb-2 text-sm text-[var(--text-secondary)] last:border-b-0 print:border-zinc-200 print:text-zinc-800',
      )}
    >
      <span className={cn('min-w-0 break-words', isTotal ? 'font-display font-semibold text-[var(--text-primary)] print:text-zinc-900' : 'font-normal')}>
        {label}
      </span>
      <span
        className={cn(
          'text-right tabular-nums whitespace-nowrap sm:justify-self-end',
          isTotal ? 'font-display text-lg font-semibold text-brand-400 print:text-brand-800' : 'font-medium text-[var(--text-primary)]',
        )}
      >
        {value}
      </span>
    </div>
  );
}

/** Khối chữ ký hai cột (phiếu thu, …). */
export function FinanceDocSignatureBlock({
  leftTitle,
  leftHint,
  rightTitle,
  rightHint,
}: {
  leftTitle: string;
  leftHint: string;
  rightTitle: string;
  rightHint: string;
}) {
  return (
    <footer className="mt-10 grid grid-cols-2 gap-8 border-t border-[var(--border-subtle)] pt-6 text-center text-sm print:border-zinc-300">
      <div>
        <p className="mb-10 text-[var(--text-muted)] print:text-zinc-600">{leftTitle}</p>
        <p className="font-medium text-[var(--text-primary)] print:text-zinc-900">{leftHint}</p>
      </div>
      <div>
        <p className="mb-10 text-[var(--text-muted)] print:text-zinc-600">{rightTitle}</p>
        <p className="font-medium text-[var(--text-secondary)] print:text-zinc-800">{rightHint}</p>
      </div>
    </footer>
  );
}
