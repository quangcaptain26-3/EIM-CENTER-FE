import { useMemo, useState } from 'react';
import { ATTENDANCE_STATUS } from '@/shared/constants/statuses';
import { Button } from '@/shared/ui/button';
import { Avatar } from '@/shared/ui/avatar';
import { cn } from '@/shared/lib/cn';
import type { SessionAttendanceRow } from '@/shared/types/session.type';

const BTNS: {
  key: string;
  label: string;
  status: string;
  activeClass: string;
  idleClass: string;
}[] = [
  {
    key: 'P',
    label: 'P',
    status: ATTENDANCE_STATUS.present,
    activeClass: 'border-green-500/60 bg-green-500/10 text-green-400 ring-2 ring-green-500/35',
    idleClass: 'border-green-500/35 text-green-400/90 hover:bg-green-500/10',
  },
  {
    key: 'L',
    label: 'L',
    status: ATTENDANCE_STATUS.late,
    activeClass: 'border-amber-500/60 bg-amber-500/10 text-amber-400 ring-2 ring-amber-500/35',
    idleClass: 'border-amber-500/35 text-amber-300/95 hover:bg-amber-500/10',
  },
  {
    key: 'A',
    label: 'A',
    status: ATTENDANCE_STATUS.absent_excused,
    activeClass: 'border-blue-500/60 bg-blue-500/10 text-blue-400 ring-2 ring-blue-500/35',
    idleClass: 'border-blue-500/35 text-blue-300/95 hover:bg-blue-500/10',
  },
  {
    key: 'U',
    label: 'U',
    status: ATTENDANCE_STATUS.absent_unexcused,
    activeClass: 'border-red-500/60 bg-red-500/10 text-red-400 ring-2 ring-red-500/35',
    idleClass: 'border-red-500/35 text-red-300/95 hover:bg-red-500/10',
  },
];

type RowState = { status: string; note: string };

function rowsSyncKey(rows: SessionAttendanceRow[]): string {
  return rows
    .map((r) => `${r.enrollmentId}:${r.studentId ?? ''}:${r.status ?? ''}:${r.note ?? ''}`)
    .join('|');
}

function buildRowState(rows: SessionAttendanceRow[]): Record<string, RowState> {
  const next: Record<string, RowState> = {};
  for (const r of rows) {
    const key = r.studentId ?? r.enrollmentId;
    next[key] = {
      status: r.status ?? '',
      note: r.note ?? '',
    };
  }
  return next;
}

export interface AttendanceFormProps {
  initialRows: SessionAttendanceRow[];
  isSubmitting?: boolean;
  /** false = chỉ xem / không tương tác */
  interactive?: boolean;
  onSubmit: (payload: {
    records: { studentId: string; enrollmentId: string; status: string; note?: string }[];
  }) => void | Promise<void>;
}

export function AttendanceForm({
  initialRows,
  isSubmitting,
  interactive = true,
  onSubmit,
}: AttendanceFormProps) {
  const [state, setState] = useState<Record<string, RowState>>(() => buildRowState(initialRows));
  const [syncKey, setSyncKey] = useState(() => rowsSyncKey(initialRows));

  const nextKey = rowsSyncKey(initialRows);
  if (nextKey !== syncKey) {
    setSyncKey(nextKey);
    setState(buildRowState(initialRows));
  }

  const rowKey = (r: SessionAttendanceRow) => r.studentId ?? r.enrollmentId;

  const counted = useMemo(() => {
    let n = 0;
    for (const r of initialRows) {
      const st = state[rowKey(r)]?.status;
      if (st && st.length > 0) n += 1;
    }
    return n;
  }, [initialRows, state]);

  const allFilled = useMemo(() => {
    if (initialRows.length === 0) return false;
    return initialRows.every((r) => {
      const st = state[rowKey(r)]?.status;
      return Boolean(st && st.length > 0);
    });
  }, [initialRows, state]);

  const setRow = (r: SessionAttendanceRow, patch: Partial<RowState>) => {
    const k = rowKey(r);
    setState((s) => ({
      ...s,
      [k]: { status: s[k]?.status ?? '', note: s[k]?.note ?? '', ...patch },
    }));
  };

  const submit = () => {
    const records = initialRows.map((r) => {
      const k = rowKey(r);
      const sid = r.studentId ?? r.enrollmentId;
      const st = state[k]?.status ?? '';
      const note = state[k]?.note ?? '';
      return {
        studentId: sid,
        enrollmentId: r.enrollmentId,
        status: st,
        note: note || undefined,
      };
    });
    void onSubmit({ records });
  };

  const needsNote = (status: string) =>
    status === ATTENDANCE_STATUS.absent_excused || status === ATTENDANCE_STATUS.absent_unexcused;

  return (
    <div className="space-y-4">
      {interactive ? (
        <p className="text-sm text-[var(--text-secondary)]">
          <span className="font-medium text-[var(--text-primary)]">
            {counted}/{initialRows.length}
          </span>{' '}
          đã điểm danh
        </p>
      ) : null}

      <ul className="space-y-4">
        {initialRows.map((r) => {
          const k = rowKey(r);
          const row = state[k] ?? { status: '', note: '' };
          const showNote = needsNote(row.status);
          const priorUnexcused = r.unexcusedAbsenceCount ?? 0;
          const warnUnexcused =
            row.status === ATTENDANCE_STATUS.absent_unexcused && priorUnexcused + 1 >= 3;

          return (
            <li
              key={r.enrollmentId}
              className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 transition-colors"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <Avatar name={r.studentName} size="md" />
                  <div className="min-w-0">
                    <p className="font-medium text-[var(--text-primary)]">{r.studentName}</p>
                    {r.studentCode ? (
                      <p className="font-mono text-xs text-[var(--text-muted)]">{r.studentCode}</p>
                    ) : null}
                    {warnUnexcused ? (
                      <p className="mt-1 text-xs text-amber-400/95">
                        Sau lần vắng này, học viên sẽ bị khóa học bù
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {BTNS.map((b) => {
                    const active = row.status === b.status;
                    return (
                      <button
                        key={b.key}
                        type="button"
                        title={b.label}
                        disabled={!interactive}
                        onClick={() => interactive && setRow(r, { status: b.status })}
                        className={cn(
                          'flex size-9 items-center justify-center rounded-lg border text-sm font-semibold transition-colors',
                          active ? b.activeClass : b.idleClass,
                          !interactive && 'cursor-not-allowed opacity-60',
                        )}
                      >
                        {b.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div
                className={cn(
                  'grid transition-[grid-template-rows] duration-200 ease-out',
                  showNote && interactive ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                )}
              >
                <div className="overflow-hidden">
                  <label className="mt-3 block text-xs text-[var(--text-muted)]">
                    Ghi chú
                    {row.status === ATTENDANCE_STATUS.absent_unexcused ? (
                      <span className="text-[var(--text-muted)]"> (nên ghi khi vắng không phép)</span>
                    ) : null}
                    <textarea
                      rows={2}
                      disabled={!interactive || !showNote}
                      value={row.note}
                      onChange={(e) => setRow(r, { note: e.target.value })}
                      className="mt-1 w-full resize-none rounded-lg border border-[var(--border-default)] bg-[var(--bg-subtle)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-brand-500 disabled:opacity-50"
                    />
                  </label>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      {interactive ? (
        <div className="flex justify-end">
          <Button type="button" isLoading={isSubmitting} disabled={!allFilled} onClick={submit}>
            Lưu điểm danh
          </Button>
        </div>
      ) : null}
    </div>
  );
}
