import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

export interface AccordionSectionProps {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
  className?: string;
}

/** Pattern FE4 — mục accordion có nút mở/đóng */
export function AccordionSection({ title, open, onToggle, children, className }: AccordionSectionProps) {
  return (
    <div className={cn('border-b border-[var(--border-subtle)] last:border-0', className)}>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-2 py-3 text-left text-sm font-medium text-[var(--text-primary)]"
      >
        <span>{title}</span>
        <ChevronDown
          className={cn('size-4 shrink-0 text-[var(--text-muted)] transition-transform', open && 'rotate-180')}
          strokeWidth={1.5}
        />
      </button>
      <div
        className={cn(
          'grid transition-[max-height] duration-300 ease-out',
          open ? 'max-h-[2400px]' : 'max-h-0 overflow-hidden',
        )}
      >
        <div className="space-y-3 pb-4">{children}</div>
      </div>
    </div>
  );
}
