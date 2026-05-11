import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { useAppSelector } from '@/app/store/hooks';
import { cn } from '@/shared/lib/cn';
import { Avatar } from '@/shared/ui/avatar';
import { RoleBadge } from '@/shared/ui/badge';
import type { RoleCode } from '@/shared/types/auth.type';
import { useClickOutside } from '@/shared/hooks/use-click-outside';
import { useLogout } from '@/presentation/hooks/auth/use-logout';

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const logout = useLogout();
  const user = useAppSelector((s) => s.auth.user);

  useClickOutside(ref, open ? () => setOpen(false) : null, open);

  if (!user) return null;

  const role = user.role as RoleCode;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center rounded-full ring-2 ring-transparent transition-shadow hover:ring-[var(--accent)]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Avatar name={user.fullName || user.email} size="md" role={role} />
      </button>

      {open ? (
        <div
          className={cn(
            'absolute right-0 top-full z-120 mt-2 w-64 overflow-hidden',
            'rounded-xl border border-slate-200 bg-white shadow-lg animate-scale-in',
            'dark:border-[var(--border-subtle)] dark:bg-[var(--bg-surface)]',
          )}
          role="menu"
        >
          <div className="border-b border-slate-200 p-3 dark:border-[var(--border-subtle)]">
            <div className="flex items-center gap-3">
              <Avatar name={user.fullName || user.email} size="lg" role={role} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-slate-900 dark:text-[var(--text-primary)]">{user.fullName}</p>
                <p className="truncate text-xs text-slate-500 dark:text-[var(--text-secondary)]">{user.email}</p>
                <div className="mt-1">
                  <RoleBadge role={role} />
                </div>
              </div>
            </div>
          </div>
          <div className="p-1">
            <Link
              to={`/users/${user.id}`}
              role="menuitem"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-800 hover:bg-slate-100 dark:text-[var(--text-primary)] dark:hover:bg-[var(--bg-elevated)]"
              onClick={() => setOpen(false)}
            >
              <User className="size-4" strokeWidth={1.5} />
              Xem hồ sơ
            </Link>
          </div>
          <div className="border-t border-slate-200 p-1 dark:border-[var(--border-subtle)]">
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
              onClick={() => {
                setOpen(false);
                logout.mutate(undefined);
              }}
            >
              <LogOut className="size-4" strokeWidth={1.5} />
              Đăng xuất
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
