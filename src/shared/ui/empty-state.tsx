import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

/** Empty state có ngữ cảnh + CTA — không chỉ một dòng chữ */
export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-12 text-center dark:border-[var(--border-default)] dark:bg-[var(--bg-elevated)]',
        className,
      )}
    >
      {icon ?? <Inbox className="size-10 text-slate-300 dark:text-[var(--text-muted)]" strokeWidth={1.5} aria-hidden />}
      <p className="text-sm font-medium text-slate-800 dark:text-[var(--text-primary)]">{title}</p>
      {description ? <p className="max-w-md text-sm text-slate-500 dark:text-[var(--text-muted)]">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
