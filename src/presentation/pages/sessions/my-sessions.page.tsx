import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/shared/ui/button';
import { DataTable } from '@/shared/ui/data-table';
import { useMySessions } from '@/presentation/hooks/sessions/use-sessions';
import { getAttendanceStatus } from '@/infrastructure/services/sessions.api';
import { RoutePaths } from '@/app/router/route-paths';
import { formatDate, formatDateTime, isTodayUtc7, todayYmdUtc7 } from '@/shared/lib/date';
import { SESSION_STATUS } from '@/shared/constants/statuses';
import type { MySessionRow } from '@/shared/types/session.type';
import { cn } from '@/shared/lib/cn';
import { Tooltip } from '@/shared/ui/tooltip';
import { attendanceDayBlockedTooltip } from '@/presentation/lib/attendance-access';

/** Tuần bắt đầu Thứ 2 (locale VN) */
function startOfWeekMonday(ref: dayjs.Dayjs): dayjs.Dayjs {
  const d = ref.day();
  const offset = d === 0 ? -6 : 1 - d;
  return ref.add(offset, 'day').startOf('day');
}

const WEEKDAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] as const;

function pickSummary(s: Record<string, number> | undefined, sessions: MySessionRow[]) {
  if (s && Object.keys(s).length > 0) {
    return {
      total: s.total ?? s.totalSessions ?? s.total_sessions ?? 0,
      taught: s.taught ?? s.completed ?? s.completedSessions ?? s.da_day ?? 0,
      upcoming: s.upcoming ?? s.upcomingSessions ?? s.sap_day ?? 0,
      cover: s.cover ?? s.coverSessions ?? s.cover_count ?? 0,
    };
  }
  const taught = sessions.filter((x) => x.status === SESSION_STATUS.completed).length;
  const todayVn = todayYmdUtc7();
  const upcoming = sessions.filter((x) => {
    const d = x.scheduledDate.slice(0, 10);
    return x.status === SESSION_STATUS.pending && d >= todayVn;
  }).length;
  const cover = sessions.filter((x) => x.roleType === 'cover').length;
  return {
    total: sessions.length,
    taught,
    upcoming,
    cover,
  };
}

export default function MySessionsPage() {
  const navigate = useNavigate();
  const [month, setMonth] = useState(() => todayYmdUtc7().slice(0, 7));
  const [view, setView] = useState<'week' | 'month' | 'list'>('list');

  const { sessions, summary, isLoading, refetch } = useMySessions({ monthKey: month });

  const stats = useMemo(() => pickSummary(summary, sessions), [summary, sessions]);

  const sortedSessions = useMemo(
    () => [...sessions].sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate)),
    [sessions],
  );

  /** Tuần hiển thị: tháng hiện tại → tuần chứa hôm nay; tháng khác → tuần chứa ngày 1 */
  const weekStart = useMemo(() => {
    const selected = dayjs(`${month}-01`);
    const now = dayjs(todayYmdUtc7());
    const anchor = selected.isSame(now, 'month') ? now : selected;
    return startOfWeekMonday(anchor);
  }, [month]);

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => weekStart.add(i, 'day')),
    [weekStart],
  );

  const sessionsByDate = useMemo(() => {
    const map = new Map<string, MySessionRow[]>();
    for (const s of sessions) {
      const d = s.scheduledDate.slice(0, 10);
      if (!map.has(d)) map.set(d, []);
      map.get(d)!.push(s);
    }
    return map;
  }, [sessions]);

  const monthGrid = useMemo(() => {
    const start = dayjs(`${month}-01`);
    const end = start.endOf('month');
    const firstDow = start.day();
    const padMon = firstDow === 0 ? 6 : firstDow - 1;
    const days: { date: string; items: MySessionRow[] }[] = [];
    let cur = start;
    while (cur.isBefore(end) || cur.isSame(end, 'day')) {
      const key = cur.format('YYYY-MM-DD');
      days.push({
        date: key,
        items: sessions.filter((s) => s.scheduledDate.startsWith(key)),
      });
      cur = cur.add(1, 'day');
    }
    return { padMon, days };
  }, [month, sessions]);

  const listColumns: ColumnDef<MySessionRow>[] = useMemo(
    () => [
      {
        id: 'date',
        header: 'Ngày',
        accessorFn: (row) => row.scheduledDate,
        cell: ({ row }) => {
          const d = row.original.scheduledDate.slice(0, 10);
          return (
            <div className="flex flex-col">
              <span className="text-[var(--text-primary)]">{formatDate(d)}</span>
              {isTodayUtc7(d) ? (
                <span className="text-[10px] font-medium text-brand-400">Hôm nay</span>
              ) : null}
            </div>
          );
        },
      },
      {
        id: 'class',
        header: 'Lớp',
        accessorFn: (row) => row.classCode ?? row.className ?? '',
        cell: ({ row }) => {
          const s = row.original;
          const cover =
            s.roleType === 'main' &&
            s.status !== SESSION_STATUS.cancelled &&
            s.coverTeacherName
              ? s.coverTeacherName
              : null;
          return (
            <div className="min-w-0">
              <span className="font-medium text-[var(--text-primary)]">{s.classCode ?? s.className ?? '—'}</span>
              {cover ? (
                <p className="mt-0.5 text-xs text-amber-200/95">
                  Cover: <span className="font-medium">{cover}</span>
                </p>
              ) : null}
            </div>
          );
        },
      },
      {
        id: 'shift',
        header: 'Ca (giờ)',
        cell: ({ row }) => <span className="text-[var(--text-secondary)]">{row.original.shiftLabel ?? '—'}</span>,
      },
      {
        id: 'role',
        header: 'Loại',
        cell: ({ row }) => (
          <span
            className={cn(
              'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
              row.original.roleType === 'cover'
                ? 'bg-amber-500/15 text-amber-300'
                : 'bg-blue-500/15 text-blue-300',
            )}
          >
            {row.original.roleType === 'cover' ? 'Cover' : 'Chính'}
          </span>
        ),
      },
      {
        id: 'status',
        header: 'Trạng thái',
        cell: ({ row }) => {
          const submitted = Boolean(row.original.submittedAt);
          return (
            <span
              className={cn(
                'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                submitted ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-500/15 text-slate-300',
              )}
            >
              {submitted ? 'Đã điểm danh' : 'Chưa điểm danh'}
            </span>
          );
        },
      },
      {
        id: 'action',
        header: '',
        cell: ({ row }) => {
          const s = row.original;
          const canAttendance =
            isTodayUtc7(s.scheduledDate) && s.status === SESSION_STATUS.pending && !s.submittedAt;
          const canViewOnly = Boolean(s.submittedAt);
          const dayBlocked = s.status === SESSION_STATUS.pending && !isTodayUtc7(s.scheduledDate);
          return (
            <div className="flex flex-wrap justify-end gap-2">
              {canAttendance ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={async () => {
                    try {
                      const status = await getAttendanceStatus(s.id);
                      if (status.locked) {
                        window.alert(
                          `Buổi ${s.classCode ?? s.className ?? ''} đã được điểm danh lúc ${status.submittedAt ? formatDateTime(status.submittedAt) : ''}. Bạn không thể điểm danh lại.`,
                        );
                      }
                    } catch (error) {
                      console.warn('Không kiểm tra được trạng thái điểm danh, mở chi tiết buổi học để xử lý.', {
                        sessionId: s.id,
                        error,
                      });
                    }
                    navigate(RoutePaths.SESSION_DETAIL.replace(':sessionId', s.id));
                  }}
                >
                  Điểm danh
                </Button>
              ) : canViewOnly ? (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => navigate(RoutePaths.SESSION_DETAIL.replace(':sessionId', s.id))}
                >
                  Xem
                </Button>
              ) : dayBlocked ? (
                <Tooltip content={attendanceDayBlockedTooltip(s.scheduledDate)}>
                  <span className="inline-flex">
                    <Button type="button" size="sm" disabled>
                      Điểm danh
                    </Button>
                  </span>
                </Tooltip>
              ) : null}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => navigate(RoutePaths.SESSION_DETAIL.replace(':sessionId', s.id))}
              >
                Chi tiết
              </Button>
            </div>
          );
        },
      },
    ],
    [navigate],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">Lịch dạy của tôi</h1>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="month"
            className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-2 py-1.5 text-sm text-[var(--text-primary)] shadow-sm"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
          <div className="flex flex-wrap gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-0.5">
            {(
              [
                ['week', 'Tuần này'],
                ['month', 'Tháng này'],
                ['list', 'Danh sách'],
              ] as const
            ).map(([k, label]) => (
              <Button
                key={k}
                type="button"
                variant={view === k ? 'primary' : 'ghost'}
                size="sm"
                className="rounded-md"
                onClick={() => setView(k)}
              >
                {label}
              </Button>
            ))}
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={() => void refetch()}>
            Làm mới
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2">
          <p className="text-[11px] uppercase tracking-wide text-[var(--text-muted)]">Tổng buổi</p>
          <p className="text-lg font-semibold text-[var(--text-primary)]">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2">
          <p className="text-[11px] uppercase tracking-wide text-[var(--text-muted)]">Đã dạy</p>
          <p className="text-lg font-semibold text-emerald-400">{stats.taught}</p>
        </div>
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2">
          <p className="text-[11px] uppercase tracking-wide text-[var(--text-muted)]">Sắp dạy</p>
          <p className="text-lg font-semibold text-sky-400">{stats.upcoming}</p>
        </div>
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2">
          <p className="text-[11px] uppercase tracking-wide text-[var(--text-muted)]">Buổi cover</p>
          <p className="text-lg font-semibold text-amber-400">{stats.cover}</p>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-[var(--text-muted)]">Đang tải…</p>
      ) : view === 'list' ? (
        <DataTable
          columns={listColumns}
          data={sortedSessions}
          total={sortedSessions.length}
          page={1}
          pageSize={Math.max(sortedSessions.length, 1)}
          onPageChange={() => {}}
          emptyMessage="Không có buổi dạy trong tháng."
          getRowId={(r) => r.id}
        />
      ) : view === 'month' ? (
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <div className="grid grid-cols-7 gap-1 text-center text-xs sm:text-sm">
              {WEEKDAY_LABELS.map((d) => (
                <div key={d} className="py-1 font-semibold text-[var(--text-muted)]">
                  {d}
                </div>
              ))}
              {Array.from({ length: monthGrid.padMon }, (_, i) => (
                <div
                  key={`pad-${i}`}
                  className="min-h-20 rounded-lg border border-transparent bg-[var(--bg-base)]"
                />
              ))}
              {monthGrid.days.map(({ date, items }) => (
                <div
                  key={date}
                  className={cn(
                    'min-h-20 rounded-lg border p-1.5 text-left transition-colors',
                    isTodayUtc7(date)
                      ? 'border-brand-500/40 bg-brand-500/5'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)]',
                  )}
                >
                  <div className="text-xs font-medium text-[var(--text-secondary)]">{dayjs(date).date()}</div>
                  <div className="mt-1 flex flex-wrap gap-0.5">
                    {items.slice(0, 4).map((s) => (
                      <span
                        key={s.id}
                        title={s.classCode ?? s.className}
                        className={cn(
                          'size-1.5 rounded-full',
                          s.roleType === 'cover' ? 'bg-amber-400' : 'bg-blue-400',
                        )}
                      />
                    ))}
                    {items.length > 4 ? (
                      <span className="text-[9px] text-[var(--text-muted)]">+{items.length - 4}</span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="grid min-w-[720px] grid-cols-7 gap-2">
            {weekDays.map((d, colIdx) => {
              const key = d.format('YYYY-MM-DD');
              const items = sessionsByDate.get(key) ?? [];
              const inMonth = d.month() === dayjs(`${month}-01`).month();
              return (
                <div
                  key={key}
                  className={cn(
                    'flex min-h-48 flex-col rounded-xl border p-2',
                    isTodayUtc7(key)
                      ? 'border-brand-500/35 bg-brand-500/6'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)]',
                    !inMonth ? 'opacity-50' : '',
                  )}
                >
                  <div className="mb-2 border-b border-[var(--border-subtle)] pb-1 text-center">
                    <div className="text-[10px] font-medium uppercase text-[var(--text-muted)]">
                      {WEEKDAY_LABELS[colIdx]}
                    </div>
                    <div className="text-sm font-semibold text-[var(--text-primary)]">{d.date()}</div>
                  </div>
                  <div className="flex flex-1 flex-col gap-2">
                    {items.map((s, idx) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => navigate(RoutePaths.SESSION_DETAIL.replace(':sessionId', s.id))}
                        className={cn(
                          'animate-slide-up rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2 text-left text-xs shadow-sm transition hover:border-[var(--border-strong)] hover:shadow-md',
                        )}
                        style={{ animationDelay: `${idx * 40}ms` }}
                      >
                        <p className="truncate font-medium text-[var(--text-primary)]">
                          {s.classCode ?? s.className ?? 'Lớp'}
                        </p>
                        <p className="truncate text-[10px] text-[var(--text-muted)]">{s.shiftLabel ?? '—'}</p>
                        <span
                          className={cn(
                            'mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium',
                            s.roleType === 'cover'
                              ? 'bg-amber-500/15 text-amber-300'
                              : 'bg-blue-500/15 text-blue-300',
                          )}
                        >
                          {s.roleType === 'cover' ? 'Cover' : 'Chính'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
