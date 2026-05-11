import { Moon, Sun } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { setTheme } from '@/app/store/ui.slice';
import type { ThemeMode } from '@/app/store/ui.slice';
import { cn } from '@/shared/lib/cn';

const segmentBase =
  'relative flex h-8 w-9 shrink-0 items-center justify-center rounded-full outline-none transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]';

function Segment({
  mode,
  active,
  onSelect,
  icon: Icon,
  label,
}: {
  mode: ThemeMode;
  active: boolean;
  onSelect: () => void;
  icon: typeof Sun;
  label: string;
}) {
  const isSun = mode === 'light';
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      aria-label={label}
      title={label}
      onClick={onSelect}
      className={cn(
        segmentBase,
        active &&
          isSun &&
          'bg-[var(--bg-surface)] text-[var(--accent)] shadow-[var(--shadow-md)] ring-1 ring-[var(--accent-border)]',
        active &&
          !isSun &&
          'bg-[var(--bg-elevated)] text-[var(--accent-text)] shadow-[var(--shadow-md)] ring-1 ring-[var(--accent-border)]',
        !active &&
          'text-[var(--text-muted)] hover:scale-105 hover:text-[var(--text-secondary)]',
      )}
    >
      <Icon
        className={cn('size-[17px] transition-transform duration-300', active && 'scale-110')}
        strokeWidth={active ? 2.25 : 1.5}
        aria-hidden
      />
    </button>
  );
}

export function HeaderThemeToggle({ className }: { className?: string }) {
  const theme = useAppSelector((s) => s.ui.theme);
  const dispatch = useAppDispatch();

  return (
    <div
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full border border-[var(--border-default)] bg-[var(--bg-subtle)] p-1 shadow-inner',
        'shadow-[inset_0_1px_2px_rgba(26,23,64,0.06)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)]',
        className,
      )}
      role="radiogroup"
      aria-label="Chế độ giao diện"
    >
      <Segment
        mode="light"
        active={theme === 'light'}
        onSelect={() => dispatch(setTheme('light'))}
        icon={Sun}
        label="Giao diện sáng"
      />
      <Segment
        mode="dark"
        active={theme === 'dark'}
        onSelect={() => dispatch(setTheme('dark'))}
        icon={Moon}
        label="Giao diện tối"
      />
    </div>
  );
}
