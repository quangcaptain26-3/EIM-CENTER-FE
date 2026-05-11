import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, GraduationCap, Loader2, Search, Users, X } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { RoutePaths } from '@/app/router/route-paths';
import { Button } from '@/shared/ui/button';
import { Avatar } from '@/shared/ui/avatar';
import type { RoleCode } from '@/shared/types/auth.type';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { useGlobalSearchQuery } from '@/presentation/hooks/use-global-search';
import type { GlobalSearchFlatItem } from '@/shared/types/global-search.type';
import { Badge, RoleBadge } from '@/shared/ui/badge';

const RECENT_KEY = 'eim-global-search-recent';
const MAX_RECENT = 5;

function readRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const p = JSON.parse(raw) as unknown;
    return Array.isArray(p) ? p.filter((x) => typeof x === 'string').slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

function writeRecent(q: string) {
  const t = q.trim();
  if (t.length < 2) return;
  const prev = readRecent().filter((x) => x.toLowerCase() !== t.toLowerCase());
  prev.unshift(t);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(prev.slice(0, MAX_RECENT)));
  } catch {
    /* ignore */
  }
}

export interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState('');
  const debounced = useDebounce(q, 300);
  const { data, isFetching, isError } = useGlobalSearchQuery(debounced);
  const [recent, setRecent] = useState<string[]>([]);
  const [highlight, setHighlight] = useState(0);
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setRecent(readRecent());
      setQ('');
      setHighlight(0);
    }
  }

  useLayoutEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
  }, [open]);

  const flatItems = useMemo((): GlobalSearchFlatItem[] => {
    if (!data) return [];
    const out: GlobalSearchFlatItem[] = [];
    for (const s of data.students) out.push({ kind: 'student', data: s });
    for (const u of data.users) out.push({ kind: 'user', data: u });
    for (const c of data.classes) out.push({ kind: 'class', data: c });
    return out;
  }, [data]);

  const resultResetKey = useMemo(
    () => `${debounced}|${flatItems.map((f) => f.data.id).join('|')}`,
    [debounced, flatItems],
  );
  const [lastResultKey, setLastResultKey] = useState('');
  if (resultResetKey !== lastResultKey) {
    setLastResultKey(resultResetKey);
    setHighlight(0);
  }

  const navigateItem = useCallback(
    (item: GlobalSearchFlatItem, searchLabel: string) => {
      writeRecent(searchLabel);
      onClose();
      if (item.kind === 'student') {
        navigate(RoutePaths.STUDENT_DETAIL.replace(':id', item.data.id));
      } else if (item.kind === 'user') {
        navigate(RoutePaths.USER_DETAIL.replace(':id', item.data.id));
      } else {
        navigate(RoutePaths.CLASS_DETAIL.replace(':classId', item.data.id));
      }
    },
    [navigate, onClose],
  );

  const onPickIndex = useCallback(
    (idx: number) => {
      const item = flatItems[idx];
      if (!item) return;
      navigateItem(item, debounced.trim());
    },
    [flatItems, debounced, navigateItem],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlight((h) => Math.min(h + 1, Math.max(0, flatItems.length - 1)));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlight((h) => Math.max(h - 1, 0));
      }
      if (e.key === 'Enter' && flatItems.length > 0) {
        e.preventDefault();
        onPickIndex(highlight);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, flatItems.length, highlight, onClose, onPickIndex]);

  const showResults = debounced.trim().length >= 2;
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-200 flex flex-col bg-black/80 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Tìm kiếm toàn cục"
    >
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Đóng" onClick={onClose} />

      <div className="relative z-201 mx-auto mt-[10vh] w-full max-w-xl px-4">
        <div className="overflow-hidden rounded-2xl border border-[var(--border-default)]/80 bg-[var(--bg-surface)] shadow-2xl">
          <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] px-4 py-3">
            <Search className="size-6 shrink-0 text-[var(--text-muted)]" strokeWidth={1.5} />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm học viên, nhân viên, lớp…"
              className="min-w-0 flex-1 bg-transparent text-lg text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
              autoComplete="off"
              autoCorrect="off"
            />
            {isFetching ? <Loader2 className="size-5 shrink-0 animate-spin text-brand-400" /> : null}
            <Button type="button" variant="ghost" size="icon-sm" onClick={onClose} aria-label="Đóng">
              <X className="size-5" strokeWidth={1.5} />
            </Button>
          </div>

          <div className="custom-scrollbar max-h-[min(60vh,480px)] overflow-y-auto p-3">
            {!showResults ? (
              <div className="space-y-2">
                <p className="px-1 text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">Gần đây</p>
                {recent.length === 0 ? (
                  <p className="px-1 py-6 text-center text-sm text-[var(--text-muted)]">Nhập ít nhất 2 ký tự để tìm.</p>
                ) : (
                  <ul className="space-y-1">
                    {recent.map((r) => (
                      <li key={r}>
                        <button
                          type="button"
                          className="w-full rounded-lg px-3 py-2 text-left text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
                          onClick={() => {
                            setQ(r);
                          }}
                        >
                          {r}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : isError ? (
              <p className="py-8 text-center text-sm text-red-400">Không tải được kết quả.</p>
            ) : !isFetching && flatItems.length === 0 ? (
              <p className="py-8 text-center text-sm text-[var(--text-muted)]">Không có kết quả.</p>
            ) : (
              <div className="space-y-6">
                {data && data.students.length > 0 ? (
                  <section>
                    <h3 className="mb-2 flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                      <GraduationCap className="size-4 text-brand-400" />
                      Học viên
                    </h3>
                    <ul className="space-y-1">
                      {data.students.map((s, i) => {
                        const idx = i;
                        const active = highlight === idx;
                        return (
                          <li key={s.id}>
                            <button
                              type="button"
                              onClick={() => navigateItem({ kind: 'student', data: s }, debounced.trim())}
                              className={cn(
                                'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                                active ? 'bg-brand-500/20 ring-1 ring-brand-500/40' : 'hover:bg-[var(--bg-elevated)]',
                              )}
                            >
                              <Avatar name={s.fullName} size="sm" />
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-medium text-[var(--text-primary)]">{s.fullName}</p>
                                <p className="font-mono text-xs text-[var(--text-muted)]">{s.studentCode}</p>
                              </div>
                              {s.status ? (
                                <Badge variant="default" className="shrink-0 text-[10px]">
                                  {s.status}
                                </Badge>
                              ) : null}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ) : null}

                {data && data.users.length > 0 ? (
                  <section>
                    <h3 className="mb-2 flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                      <Users className="size-4 text-emerald-400" />
                      Nhân viên
                    </h3>
                    <ul className="space-y-1">
                      {data.users.map((u, j) => {
                        const idx = (data?.students.length ?? 0) + j;
                        const active = highlight === idx;
                        return (
                          <li key={u.id}>
                            <button
                              type="button"
                              onClick={() => navigateItem({ kind: 'user', data: u }, debounced.trim())}
                              className={cn(
                                'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                                active ? 'bg-brand-500/20 ring-1 ring-brand-500/40' : 'hover:bg-[var(--bg-elevated)]',
                              )}
                            >
                              <Avatar name={u.fullName} size="sm" />
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-medium text-[var(--text-primary)]">{u.fullName}</p>
                                {u.userCode ? (
                                  <p className="font-mono text-xs text-[var(--text-muted)]">{u.userCode}</p>
                                ) : null}
                              </div>
                              {u.roleCode ? <RoleBadge role={u.roleCode as RoleCode} className="shrink-0 scale-90" /> : null}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ) : null}

                {data && data.classes.length > 0 ? (
                  <section>
                    <h3 className="mb-2 flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                      <BookOpen className="size-4 text-amber-400" />
                      Lớp học
                    </h3>
                    <ul className="space-y-1">
                      {data.classes.map((c, k) => {
                        const idx = (data?.students.length ?? 0) + (data?.users.length ?? 0) + k;
                        const active = highlight === idx;
                        return (
                          <li key={c.id}>
                            <button
                              type="button"
                              onClick={() => navigateItem({ kind: 'class', data: c }, debounced.trim())}
                              className={cn(
                                'flex w-full flex-col gap-0.5 rounded-xl px-3 py-2.5 text-left transition-colors',
                                active ? 'bg-brand-500/20 ring-1 ring-brand-500/40' : 'hover:bg-[var(--bg-elevated)]',
                              )}
                            >
                              <span className="font-mono text-sm font-semibold text-brand-300">{c.classCode}</span>
                              <span className="text-xs text-[var(--text-secondary)]">{c.programName ?? '—'}</span>
                              {c.status ? (
                                <span className="text-[10px] uppercase text-[var(--text-muted)]">{c.status}</span>
                              ) : null}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ) : null}
              </div>
            )}
          </div>

          <div className="border-t border-[var(--border-subtle)] px-4 py-2 text-center text-[11px] text-[var(--text-muted)]">
            <span className="inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
              <span>
                <kbd className="rounded bg-[var(--bg-elevated)] px-1">↑↓</kbd> Di chuyển
              </span>
              <span>
                <kbd className="rounded bg-[var(--bg-elevated)] px-1">↵</kbd> Chọn
              </span>
              <span>
                <kbd className="rounded bg-[var(--bg-elevated)] px-1">ESC</kbd> Đóng
              </span>
              <span>
                <kbd className="rounded bg-[var(--bg-elevated)] px-1">{isMac ? '⌘' : 'Ctrl'}+K</kbd> Mở
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
