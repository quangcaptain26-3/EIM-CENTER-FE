import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

export type TabsVariant = 'underline' | 'pills';

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: TabsVariant;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, variant = 'underline', className }: TabsProps) {
  if (variant === 'pills') {
    return (
      <div
        role="tablist"
        className={cn('inline-flex gap-1 rounded-lg bg-[var(--bg-subtle)] p-1', className)}
      >
        {tabs.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(tab.id)}
              className={cn(
                'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-[var(--bg-overlay)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
              )}
            >
              {tab.icon ? <span className="shrink-0 [&_svg]:size-4">{tab.icon}</span> : null}
              <span>{tab.label}</span>
              {tab.badge ? <span className="shrink-0">{tab.badge}</span> : null}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      role="tablist"
      className={cn('flex flex-wrap gap-1 border-b border-[var(--border-subtle)]', className)}
    >
      {tabs.map((tab) => {
        const active = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={cn(
              '-mb-px inline-flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'border-brand-500 text-[var(--text-primary)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]',
            )}
          >
            {tab.icon ? <span className="shrink-0 [&_svg]:size-4">{tab.icon}</span> : null}
            <span>{tab.label}</span>
            {tab.badge ? <span className="shrink-0">{tab.badge}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
