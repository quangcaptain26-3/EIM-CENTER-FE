import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

/**
 * Tiêu đề trang chuẩn shell: title + subtitle + actions (nút bên phải).
 */
export function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        'mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="eim-page-title">{title}</h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2 sm:ml-auto">{actions}</div> : null}
    </div>
  );
}
