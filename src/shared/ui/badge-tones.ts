/** Class Tailwind dùng chung — map tới token trong `styles/index.css` (light + dark). */

export const BADGE_BASE =
  'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium';

export const ENROLLMENT_BADGE_CLASS: Record<string, string> = {
  reserved:
    'bg-[var(--badge-reserved-bg)] text-[var(--badge-reserved-text)] border-[var(--badge-reserved-border)]',
  pending:
    'bg-[var(--badge-pending-bg)] text-[var(--badge-pending-text)] border-[var(--badge-pending-border)]',
  trial:
    'bg-[var(--badge-trial-bg)] text-[var(--badge-trial-text)] border-[var(--badge-trial-border)]',
  active:
    'bg-[var(--badge-active-bg)] text-[var(--badge-active-text)] border-[var(--badge-active-border)]',
  paused:
    'bg-[var(--badge-paused-bg)] text-[var(--badge-paused-text)] border-[var(--badge-paused-border)]',
  transferred:
    'bg-[var(--badge-transferred-bg)] text-[var(--badge-transferred-text)] border-[var(--badge-transferred-border)]',
  dropped:
    'bg-[var(--badge-dropped-bg)] text-[var(--badge-dropped-text)] border-[var(--badge-dropped-border)]',
  completed:
    'bg-[var(--badge-completed-bg)] text-[var(--badge-completed-text)] border-[var(--badge-completed-border)]',
};

export const SESSION_BADGE_CLASS: Record<string, string> = {
  pending:
    'bg-[var(--badge-pending-bg)] text-[var(--badge-pending-text)] border-[var(--badge-pending-border)]',
  completed:
    'bg-[var(--badge-active-bg)] text-[var(--badge-active-text)] border-[var(--badge-active-border)]',
  cancelled:
    'bg-[var(--badge-dropped-bg)] text-[var(--badge-dropped-text)] border-[var(--badge-dropped-border)]',
};

export const COVER_BADGE_CLASS: Record<string, string> = {
  pending:
    'bg-[var(--badge-pending-bg)] text-[var(--badge-pending-text)] border-[var(--badge-pending-border)]',
  confirmed:
    'bg-[var(--badge-trial-bg)] text-[var(--badge-trial-text)] border-[var(--badge-trial-border)]',
  completed:
    'bg-[var(--badge-active-bg)] text-[var(--badge-active-text)] border-[var(--badge-active-border)]',
  cancelled:
    'bg-[var(--badge-dropped-bg)] text-[var(--badge-dropped-text)] border-[var(--badge-dropped-border)]',
};

export const ENROLLMENT_BADGE_FALLBACK =
  'border-[var(--border-default)] bg-[var(--bg-subtle)] text-[var(--text-secondary)]';
