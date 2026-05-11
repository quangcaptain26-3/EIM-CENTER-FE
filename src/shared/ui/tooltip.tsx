import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

export type TooltipSide = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  content: string;
  side?: TooltipSide;
}

/**
 * Tooltip chỉ CSS (`::after`), không portal.
 * Cần stylesheet `utilities.css` với `[data-tooltip]` / `[data-tooltip-side]`.
 */
export function Tooltip({
  children,
  content,
  side = 'top',
  className,
  tabIndex = 0,
  ...rest
}: TooltipProps) {
  return (
    <span
      className={cn('inline-flex outline-none', className)}
      data-tooltip={content}
      data-tooltip-side={side}
      tabIndex={tabIndex}
      {...rest}
    >
      {children}
    </span>
  );
}
