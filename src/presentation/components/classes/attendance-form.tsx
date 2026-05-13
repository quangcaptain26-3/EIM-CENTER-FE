import { useMemo, useState } from 'react';
import { ATTENDANCE_STATUS } from '@/shared/constants/statuses';
import { Button } from '@/shared/ui/button';
import { Avatar } from '@/shared/ui/avatar';
import { cn } from '@/shared/lib/cn';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
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
  readOnlyReason?: string;
  submitLabel?: string;
  editReasonRequired?: boolean;
  editReasonValue?: string;
  onEditReasonChange?: (value: string) => void;
  confirmMessage?: string;
  onSubmit: (payload: {
    records: { studentId: string; enrollmentId: string; status: string; note?: string }[];
  }) => void | Promise<void>;
}

export function AttendanceForm({
  initialRows,
  isSubmitting,
  interactive = true,
  readOnlyReason,
  submitLabel = 'Hoàn tất điểm danh',
  editReasonRequired = false,
  editReasonValue = '',
  onEditReasonChange,
  confirmMessage,
  onSubmit,
}: AttendanceFormProps) {
  const [state, setState] = useState<Record<string, RowState>>(() => buildRowState(initialRows));
  const [syncKey, setSyncKey] = useState(() => rowsSyncKey(initialRows));
  const [confirmOpen, setConfirmOpen] = useState(false);

  const nextKey = rowsSyncKey(initialRows);
  if (nextKey !== syncKey) {
    setSyncKey(nextKey);
    setState(buildRowState(initialRows));
  }

  const rowKey = (r: SessionAttendanceRow) => r.studentId ?? r.enrollmentId;
  const isPausedEnrollment = (r: SessionAttendanceRow) => r.enrollmentStatus === 'paused';

  const summary = useMemo(() => {
    let p = 0;
    let l = 0;
    let a = 0;
    let u = 0;
    let unselected = 0;
    for (const r of initialRows) {
      if (isPausedEnrollment(r)) continue;
      const st = state[rowKey(r)]?.status;
      if (!st) {
        unselected += 1;
        continue;
      }
      if (st === ATTENDANCE_STATUS.present) p += 1;
      else if (st === ATTENDANCE_STATUS.late) l += 1;
      else if (st === ATTENDANCE_STATUS.absent_excused) a += 1;
      else if (st === ATTENDANCE_STATUS.absent_unexcused) u += 1;
    }
    return { p, l, a, u, unselected };
  }, [initialRows, state]);
  const selectableCount = useMemo(
    () => initialRows.filter((r) => !isPausedEnrollment(r)).length,
    [initialRows],
  );

  const allFilled = useMemo(() => {
    const selectableRows = initialRows.filter((r) => !isPausedEnrollment(r));
    if (selectableRows.length === 0) return false;
    const rowsFilled = selectableRows.every((r) => {
      const st = state[rowKey(r)]?.status;
      return Boolean(st && st.length > 0);
    });
    if (!rowsFilled) return false;
    if (editReasonRequired) return Boolean(editReasonValue.trim());
    return true;
  }, [initialRows, state, editReasonRequired, editReasonValue]);
  const submitBlockedReason = useMemo(() => {
    if (selectableCount === 0) {
      return 'Không có học viên đang học để điểm danh.';
    }
    if (summary.unselected > 0) {
      return `Còn ${summary.unselected} học viên chưa chọn trạng thái điểm danh.`;
    }
    if (editReasonRequired && !editReasonValue.trim()) {
      return 'Vui lòng nhập lý do chỉnh sửa trước khi lưu.';
    }
    return null;
  }, [selectableCount, summary.unselected, editReasonRequired, editReasonValue]);

  const setRow = (r: SessionAttendanceRow, patch: Partial<RowState>) => {
    const k = rowKey(r);
    setState((s) => ({
      ...s,
      [k]: { status: s[k]?.status ?? '', note: s[k]?.note ?? '', ...patch },
    }));
  };

  const submit = () => {
    const records = initialRows
      .filter((r) => !isPausedEnrollment(r))
      .map((r) => {
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
      })
      .filter((r) => Boolean(r.status));
    void onSubmit({ records });
  };

  const needsNote = (status: string) =>
    status === ATTENDANCE_STATUS.absent_excused || status === ATTENDANCE_STATUS.absent_unexcused;

  return (
    <div className="space-y-4">
      {interactive ? (
        <p className="text-sm text-[var(--text-secondary)]">
          <span className="font-medium text-[var(--text-primary)]">
            {summary.p + summary.l + summary.a + summary.u}/{selectableCount}
          </span>{' '}
          đã điểm danh
        </p>
      ) : null}

      <ul className="space-y-4">
        {initialRows.map((r) => {
          const k = rowKey(r);
          const row = state[k] ?? { status: '', note: '' };
          const isPaused = isPausedEnrollment(r);
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
                    {isPaused ? (
                      <p className="mt-1 inline-flex rounded-full border border-amber-500/35 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-200">
                        Đang bảo lưu
                      </p>
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
                        title={!interactive && readOnlyReason ? readOnlyReason : b.label}
                        disabled={!interactive || isPaused}
                        onClick={() => interactive && !isPaused && setRow(r, { status: b.status })}
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
                  showNote && interactive && !isPaused ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
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
                      disabled={!interactive || !showNote || isPaused}
                      title={!interactive && readOnlyReason ? readOnlyReason : undefined}
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
        <div className="sticky bottom-3 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/95 px-4 py-3 backdrop-blur">
          {editReasonRequired ? (
            <div className="w-full">
              <label className="block text-xs text-[var(--text-muted)]">
                Lý do chỉnh sửa <span className="text-red-400">*</span>
                <textarea
                  rows={2}
                  value={editReasonValue}
                  onChange={(e) => onEditReasonChange?.(e.target.value)}
                  className="mt-1 w-full resize-none rounded-lg border border-[var(--border-default)] bg-[var(--bg-subtle)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-brand-500"
                  placeholder="Nhập lý do chỉnh sửa điểm danh"
                />
              </label>
            </div>
          ) : null}
          <p className="text-sm text-[var(--text-secondary)]">
            <span className="font-medium text-emerald-300">P:{summary.p}</span> ·{' '}
            <span className="font-medium text-amber-300">L:{summary.l}</span> ·{' '}
            <span className="font-medium text-blue-300">A:{summary.a}</span> ·{' '}
            <span className="font-medium text-red-300">U:{summary.u}</span> ·{' '}
            <span className="font-medium text-[var(--text-muted)]">Chưa:{summary.unselected}</span>
          </p>
          <Button
            type="button"
            isLoading={isSubmitting}
            disabled={!allFilled}
            title={!allFilled ? submitBlockedReason ?? undefined : undefined}
            onClick={() => setConfirmOpen(true)}
          >
            {submitLabel}
          </Button>
          {!allFilled && submitBlockedReason ? (
            <p className="w-full text-xs text-amber-300/95">{submitBlockedReason}</p>
          ) : null}
        </div>
      ) : null}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        variant="warning"
        title="Xác nhận điểm danh"
        message={
          confirmMessage
          ?? `Điểm danh buổi học: ${summary.p + summary.l} có mặt, ${summary.a + summary.u} vắng. Xác nhận?`
        }
        confirmLabel="Xác nhận"
        cancelLabel="Xem lại"
        loading={Boolean(isSubmitting)}
        onConfirm={async () => {
          setConfirmOpen(false);
          submit();
        }}
      />
    </div>
  );
}
