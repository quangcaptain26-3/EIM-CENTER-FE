import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { SearchBox } from '@/shared/ui/search-box';
import { Avatar } from '@/shared/ui/avatar';
import { SessionProgressBar } from '@/shared/ui/session-progress-bar';
import { useClassesList } from '@/presentation/hooks/classes/use-classes';
import { useParsedPrograms } from '@/presentation/hooks/classes/use-classes';
import { usePermission } from '@/presentation/hooks/use-permission';
import { RoutePaths } from '@/app/router/route-paths';
import type { ClassListItem } from '@/shared/types/class.type';
import { FALLBACK_PROGRAMS } from '@/presentation/components/classes/class-form.constants';
import {
  inferProgramSlug,
  programPillClass,
  type ProgramFilterSlug,
} from '@/presentation/components/classes/program-theme';
import { cn } from '@/shared/lib/cn';

function ClassStatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const label =
    s === 'active' ? 'Active' : s === 'closed' ? 'Closed' : s === 'pending' ? 'Pending' : status;
  const cls =
    s === 'active'
      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
      : s === 'closed'
        ? 'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400'
        : s === 'pending'
          ? 'border-[var(--border-default)] bg-[var(--bg-overlay)] text-[var(--text-muted)]'
          : 'border-[var(--border-default)] bg-[var(--bg-subtle)] text-[var(--text-secondary)]';
  return (
    <span
      className={cn(
        'inline-flex shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium capitalize',
        cls,
      )}
    >
      {label}
    </span>
  );
}

const STATUS_OPTIONS: { value: '' | 'pending' | 'active' | 'closed'; label: string }[] = [
  { value: '', label: 'Tất cả' },
  { value: 'pending', label: 'Pending' },
  { value: 'active', label: 'Active' },
  { value: 'closed', label: 'Closed' },
];

const SHIFT_OPTIONS: { value: '' | 'SHIFT_1' | 'SHIFT_2'; label: string }[] = [
  { value: '', label: 'Tất cả' },
  { value: 'SHIFT_1', label: 'Ca 1' },
  { value: 'SHIFT_2', label: 'Ca 2' },
];

const PROGRAM_TABS: { id: ProgramFilterSlug; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'kindy', label: 'Kindy' },
  { id: 'starters', label: 'Starters' },
  { id: 'movers', label: 'Movers' },
  { id: 'flyers', label: 'Flyers' },
];

function ClassCard({
  c,
  index,
  onClick,
}: {
  c: ClassListItem;
  index: number;
  onClick: () => void;
}) {
  const done = c.completedSessions ?? 0;
  const total = c.totalSessions ?? 24;
  const pillCls = programPillClass(c.programName);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex w-full flex-col rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 text-left text-[var(--text-primary)] shadow-[var(--shadow-card)] transition-all duration-200',
        'hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-md)]',
        'animate-slide-up focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50',
      )}
      style={{ animationDelay: `${index * 45}ms` }}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="rounded-lg border border-brand-500/25 bg-brand-500/10 px-2 py-0.5 font-mono text-xs font-medium text-brand-700 dark:border-brand-500/20 dark:text-brand-300">
          {c.classCode}
        </span>
        <ClassStatusBadge status={c.status} />
      </div>
      {c.programName ? (
        <span className={cn('mt-3 inline-flex w-fit rounded-full border px-2.5 py-0.5 text-xs font-medium', pillCls)}>
          {c.programName}
        </span>
      ) : null}
      <div className="mt-4 flex items-center gap-2">
        <Avatar name={c.mainTeacherName ?? '?'} size="sm" />
        <span className="truncate text-sm text-[var(--text-secondary)]">{c.mainTeacherName ?? '—'}</span>
      </div>
      <p className="mt-3 text-xs text-[var(--text-muted)]">
        <span className="text-[var(--text-secondary)]">{c.shiftLabel ?? '—'}</span>
        <span className="mx-1.5 opacity-60">·</span>
        <span>{c.scheduleLabel ?? '—'}</span>
        <span className="mx-1.5 opacity-60">·</span>
        <span>
          Sĩ số {c.enrollmentCount ?? 0}/12
        </span>
      </p>
      <div className="mt-4">
        <SessionProgressBar completed={done} total={total} />
      </div>
    </button>
  );
}

export function ClassListPage() {
  const navigate = useNavigate();
  const { canManageAcademicEnrollment: canCreate } = usePermission();

  const [page, setPage] = useState(1);
  const limit = 12;
  const [search, setSearch] = useState('');
  const [programFilter, setProgramFilter] = useState<ProgramFilterSlug>('all');
  const [status, setStatus] = useState<'' | 'pending' | 'active' | 'closed'>('');
  const [shift, setShift] = useState<'' | 'SHIFT_1' | 'SHIFT_2'>('');

  const { programs: apiPrograms } = useParsedPrograms();
  const allPrograms = useMemo(
    () => (apiPrograms.length ? apiPrograms : FALLBACK_PROGRAMS),
    [apiPrograms],
  );

  const programId = useMemo(() => {
    if (programFilter === 'all') return undefined;
    const match = allPrograms.find((p) => inferProgramSlug(p.name) === programFilter);
    return match?.id;
  }, [allPrograms, programFilter]);

  const listParams = useMemo(
    () => ({
      page,
      limit,
      search: search || undefined,
      programId,
      status: status || undefined,
      shift: shift || undefined,
    }),
    [page, limit, search, programId, status, shift],
  );

  const { classes, total, isLoading, isFetching } = useClassesList(listParams);

  const onSearch = useCallback((q: string) => {
    setPage(1);
    setSearch(q);
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-xl font-semibold text-[var(--text-primary)]">Lớp học</h1>
          <Badge variant="brand" className="tabular-nums">
            {total}
          </Badge>
        </div>
        {canCreate ? (
          <Button type="button" onClick={() => navigate(RoutePaths.CLASS_NEW)}>
            Tạo lớp
          </Button>
        ) : null}
      </div>

      <div className="space-y-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] p-4">
        <SearchBox
          placeholder="Tìm mã lớp, tên giáo viên…"
          onSearch={onSearch}
          isLoading={isFetching && !isLoading}
        />

        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]">
            Chương trình
          </p>
          <div className="flex flex-wrap gap-2">
            {PROGRAM_TABS.map((t) => (
              <Button
                key={t.id}
                type="button"
                size="sm"
                variant={programFilter === t.id ? 'primary' : 'outline'}
                className={cn(programFilter === t.id && 'pointer-events-none')}
                onClick={() => {
                  setPage(1);
                  setProgramFilter(t.id);
                }}
              >
                {t.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]">
              Trạng thái
            </p>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((o) => (
                <Button
                  key={o.value || 'all'}
                  type="button"
                  size="sm"
                  variant={status === o.value ? 'primary' : 'outline'}
                  onClick={() => {
                    setPage(1);
                    setStatus(o.value);
                  }}
                >
                  {o.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]">Ca</p>
            <div className="flex flex-wrap gap-2">
              {SHIFT_OPTIONS.map((o) => (
                <Button
                  key={o.value || 'all-shift'}
                  type="button"
                  size="sm"
                  variant={shift === o.value ? 'primary' : 'outline'}
                  onClick={() => {
                    setPage(1);
                    setShift(o.value);
                  }}
                >
                  {o.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-[var(--text-muted)]">Đang tải…</p>
      ) : classes.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--border-default)] py-16 text-center text-sm text-[var(--text-muted)]">
          Không có lớp phù hợp.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {classes.map((c, i) => (
            <ClassCard
              key={c.id}
              c={c}
              index={i}
              onClick={() => navigate(RoutePaths.CLASS_DETAIL.replace(':classId', c.id))}
            />
          ))}
        </div>
      )}

      {totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm text-[var(--text-muted)]">
          <span>
            Trang {page} / {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Trước
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Sau
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
