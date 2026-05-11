import { Suspense, useCallback, useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  PanelLeftClose,
  Search,
} from 'lucide-react';
import { useAppSelector } from '@/app/store/hooks';
import { useLogout } from '@/presentation/hooks/auth/use-logout';
import { useSidebarMenuGrouped } from '@/presentation/hooks/use-sidebar-menu';
import { useLocalStorage } from '@/shared/hooks/use-local-storage';
import { usePausePendingCount } from '@/presentation/hooks/use-pause-pending-count';
import { ROLES } from '@/shared/constants/roles';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';
import { Avatar } from '@/shared/ui/avatar';
import { RoleBadge } from '@/shared/ui/badge';
import type { RoleCode } from '@/shared/types/auth.type';
import type { SidebarBadgeKey } from '@/presentation/layouts/sidebar-menu.config';
import { AppBreadcrumb } from '@/presentation/layouts/shell/app-breadcrumb';
import { SearchOverlay } from '@/presentation/layouts/shell/search-overlay';
import { NotificationMenu } from '@/presentation/layouts/shell/notification-menu';
import { UserMenu } from '@/presentation/layouts/shell/user-menu';
import { HeaderThemeToggle } from '@/presentation/layouts/shell/header-theme-toggle';
import { PageLoader } from '@/presentation/layouts/page-loader';
import { RouteErrorBoundary } from '@/presentation/layouts/route-error-boundary';
const SIDEBAR_LS_KEY = 'eim-sidebar-collapsed';

function badgeCount(
  key: SidebarBadgeKey | undefined,
  pauseCount: number,
): number | undefined {
  if (key === 'pause-pending') return pauseCount > 0 ? pauseCount : undefined;
  return undefined;
}

function DashboardOutlet() {
  const location = useLocation();
  return (
    <RouteErrorBoundary resetKey={location.pathname}>
      <div key={location.pathname} className="animate-fade-in">
        <Outlet />
      </div>
    </RouteErrorBoundary>
  );
}

const navLinkClass = (collapsed: boolean, isActive: boolean) =>
  cn(
    'relative flex items-center gap-3 rounded-lg border-l-2 border-transparent py-2.5 text-sm transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
    collapsed ? 'justify-center px-0' : 'pl-2 pr-3',
    isActive
      ? 'border-l-brand-500 bg-brand-500/8 font-medium text-brand-700 dark:bg-brand-500/12 dark:text-brand-400'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-[var(--text-secondary)] dark:hover:bg-[var(--bg-elevated)] dark:hover:text-[var(--text-primary)]',
  );

export function DashboardLayout() {
  const user = useAppSelector((s) => s.auth.user);
  const logout = useLogout();
  const menuGroups = useSidebarMenuGrouped();

  const [collapsed, setCollapsed] = useLocalStorage<boolean>(SIDEBAR_LS_KEY, false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const role = user?.role;
  const showPauseBadge = role === ROLES.ADMIN || role === ROLES.ACADEMIC;
  const { data: pauseCount = 0 } = usePausePendingCount(Boolean(showPauseBadge));

  useEffect(() => {
    if (!mobileOpen) return;
    const mq = window.matchMedia('(min-width: 1024px)');
    const onResize = () => {
      if (mq.matches) setMobileOpen(false);
    };
    mq.addEventListener('change', onResize);
    return () => mq.removeEventListener('change', onResize);
  }, [mobileOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setCollapsed((c) => !c);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const userRole = user?.role as RoleCode | undefined;

  return (
    <div className="flex min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      {mobileOpen ? (
        <button
          type="button"
          aria-label="Đóng menu"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={closeMobile}
        />
      ) : null}

      <aside
        className={cn(
          'sidebar fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-sidebar)] shadow-[var(--shadow-card)] transition-[width,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:static lg:translate-x-0',
          collapsed ? 'w-16' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div
          className={cn(
            'relative flex h-14 shrink-0 items-center border-b border-[var(--border-subtle)] px-3',
            collapsed ? 'justify-center' : 'justify-between gap-2',
          )}
        >
          <div className={cn('flex min-w-0 items-center gap-2', collapsed && 'justify-center')}>
            <div className="flex items-center gap-1.5">
              <span className="font-display text-2xl font-bold text-[var(--accent)]">EIM</span>
              <span className="size-[6px] shrink-0 rounded-full bg-[var(--accent)]" aria-hidden />
            </div>
            {!collapsed ? (
              <span className="truncate text-xs font-medium text-[var(--text-muted)]">
                Trung tâm tiếng Anh
              </span>
            ) : null}
          </div>
          <button
            type="button"
            className="absolute -right-3 top-1/2 z-10 hidden size-7 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-secondary)] shadow-[var(--shadow-md)] hover:bg-[var(--bg-subtle)] lg:flex"
            aria-label={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
            onClick={() => setCollapsed((c) => !c)}
          >
            {collapsed ? (
              <ChevronRight className="size-4" strokeWidth={1.5} />
            ) : (
              <ChevronLeft className="size-4" strokeWidth={1.5} />
            )}
          </button>
          <button
            type="button"
            className="inline-flex rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] lg:hidden"
            aria-label="Đóng menu"
            onClick={closeMobile}
          >
            <PanelLeftClose className="size-5" strokeWidth={1.5} />
          </button>
        </div>

        <nav className="custom-scrollbar flex-1 space-y-4 overflow-y-auto p-2 pt-3">
          {menuGroups.map((group) => (
            <div key={group.id}>
              {!collapsed ? (
                <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]">
                  {group.label}
                </p>
              ) : null}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const count = badgeCount(item.badgeKey, pauseCount);
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.end ?? false}
                      {...(collapsed
                        ? { 'data-tooltip': item.label, 'data-tooltip-side': 'right' as const }
                        : {})}
                      onClick={closeMobile}
                      className={({ isActive }) => navLinkClass(collapsed, isActive)}
                    >
                      <span className="relative shrink-0 [&_svg]:stroke-current">
                        <item.icon className="size-5" strokeWidth={1.5} aria-hidden />
                        {count != null ? (
                          <span className="absolute -right-1.5 -top-1 flex h-4 min-w-4 animate-pulse items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                            {count > 9 ? '9+' : count}
                          </span>
                        ) : null}
                      </span>
                      {!collapsed ? <span className="truncate">{item.label}</span> : null}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-auto shrink-0 border-t border-[var(--border-subtle)] bg-[var(--bg-sidebar)] p-3">
          {user ? (
            <div
              className={cn(
                'mb-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-3 shadow-[var(--shadow-xs)]',
                collapsed && 'border-0 bg-transparent p-0 shadow-none',
              )}
            >
              <div
                className={cn(
                  'flex items-center gap-3',
                  collapsed ? 'justify-center' : '',
                )}
              >
                <Avatar
                  name={user.fullName || user.email}
                  size={collapsed ? 'sm' : 'md'}
                  role={userRole}
                  className="!bg-[var(--accent)] text-white shadow-sm ring-2 ring-[var(--accent)]/20 [background-image:none]"
                />
                {!collapsed ? (
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-sm font-semibold text-[var(--text-primary)]">
                      {user.fullName}
                    </p>
                    <RoleBadge
                      role={user.role as RoleCode}
                      className="mt-1.5"
                    />
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            title={collapsed ? 'Đăng xuất' : undefined}
            className={cn(
              'h-auto w-full flex-col gap-1 py-2.5 text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]',
              collapsed && 'px-0',
            )}
            onClick={() => logout.mutate(undefined)}
          >
            <LogOut className="size-5 shrink-0 opacity-90" strokeWidth={1.5} aria-hidden />
            {!collapsed ? (
              <span className="text-xs font-medium leading-tight">Đăng xuất</span>
            ) : (
              <span className="sr-only">Đăng xuất</span>
            )}
          </Button>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:min-w-0">
        <header className="app-no-print sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 px-3 backdrop-blur-md lg:px-4">
          <button
            type="button"
            className="inline-flex rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-[var(--text-muted)] dark:hover:bg-[var(--bg-elevated)] dark:hover:text-[var(--text-primary)] lg:hidden"
            aria-label="Mở menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-5" strokeWidth={1.5} />
          </button>

          <AppBreadcrumb className="min-w-0 flex-1" />

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <button
              type="button"
              title="Tìm kiếm (⌘K / Ctrl+K)"
              className="hidden min-w-[200px] items-center gap-3 rounded-xl border border-slate-200 bg-slate-100 px-3 py-1.5 text-left text-sm text-slate-500 transition-colors hover:border-slate-300 dark:border-[var(--border-default)] dark:bg-[var(--bg-elevated)] dark:text-[var(--text-muted)] dark:hover:border-[var(--border-strong)] sm:flex"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="size-4 shrink-0 opacity-70" strokeWidth={1.5} />
              <span className="flex-1 truncate">Tìm kiếm...</span>
              <kbd className="rounded border border-[var(--border-default)] bg-[var(--bg-surface)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--text-muted)]">
                ⌘K
              </kbd>
            </button>
            <button
              type="button"
              className="flex size-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-[var(--text-muted)] dark:hover:bg-[var(--bg-elevated)] dark:hover:text-[var(--text-primary)] sm:hidden"
              aria-label="Tìm kiếm"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="size-[18px]" strokeWidth={1.5} />
            </button>
            <HeaderThemeToggle />
            <NotificationMenu />
            <UserMenu />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[var(--bg-base)] p-6">
          <div className="mx-auto max-w-screen-2xl">
            <Suspense fallback={<PageLoader />}>
              <DashboardOutlet />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
