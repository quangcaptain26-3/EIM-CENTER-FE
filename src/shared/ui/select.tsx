import { forwardRef, type ReactNode, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  /** Nội dung <option> — ưu tiên hơn children nếu cả hai có */
  options?: { value: string | number; label: string }[];
  children?: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, error, disabled, children, options, ...props },
  ref,
) {
  return (
    <div className="relative w-full">
      <select
        ref={ref}
        disabled={disabled}
        className={cn(
          'h-9 w-full cursor-pointer appearance-none rounded-lg border bg-[var(--bg-surface)]',
          'px-3 py-2 pr-9 text-sm text-[var(--text-primary)] transition-[border-color,box-shadow]',
          'outline-none focus:outline-none',
          error
            ? 'border-red-500/50 shadow-[0_0_0_3px_rgba(239,68,68,0.15)]'
            : cn(
                'border-[var(--border-default)] hover:border-[var(--border-strong)]',
                'focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_rgba(108,99,255,0.2)]',
              ),
          disabled && 'cursor-not-allowed opacity-40',
          className,
        )}
        {...props}
      >
        {options
          ? options.map((o) => (
              <option key={String(o.value)} value={o.value}>
                {o.label}
              </option>
            ))
          : children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-[var(--text-muted)]"
        strokeWidth={1.5}
        aria-hidden
      />
    </div>
  );
});

Select.displayName = 'Select';
