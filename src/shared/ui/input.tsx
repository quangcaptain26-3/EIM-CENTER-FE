import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, error, leftIcon, rightIcon, disabled, ...props },
  ref,
) {
  const hasLeft = Boolean(leftIcon);
  const hasRight = Boolean(rightIcon);

  return (
    <div
      className={cn(
        'relative flex w-full items-center rounded-lg border bg-[var(--bg-subtle)] transition-[border-color,box-shadow]',
        error
          ? 'border-red-500/50 shadow-[0_0_0_3px_rgba(239,68,68,0.15)]'
          : 'border-[var(--border-default)] shadow-none hover:border-[var(--border-strong)]',
        !error &&
          'focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent-subtle)]',
        disabled && 'pointer-events-none opacity-40',
      )}
    >
      {hasLeft ? (
        <span className="pointer-events-none absolute left-2.5 inline-flex text-[var(--text-muted)] [&_svg]:size-4">
          {leftIcon}
        </span>
      ) : null}
      <input
        ref={ref}
        disabled={disabled}
        className={cn(
          'h-9 w-full min-w-0 rounded-lg bg-transparent px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
          'outline-none focus:outline-none',
          hasLeft && 'pl-9',
          hasRight && 'pr-9',
          className,
        )}
        {...props}
      />
      {hasRight ? (
        <span className="absolute right-2.5 inline-flex text-[var(--text-muted)] [&_svg]:size-4">
          {rightIcon}
        </span>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
