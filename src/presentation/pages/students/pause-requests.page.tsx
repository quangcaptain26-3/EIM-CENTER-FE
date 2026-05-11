import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/shared/ui/button';
import { DataTable } from '@/shared/ui/data-table';
import { Avatar } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import {
  useApprovePauseRequest,
  usePauseRequestsList,
  useRejectPauseRequest,
} from '@/presentation/hooks/students/use-pause-requests';
import type { PauseRequestRow } from '@/shared/types/student.type';
import { cn } from '@/shared/lib/cn';
import { usePermission } from '@/presentation/hooks/use-permission';

type TabKey = 'pending' | 'approved' | 'rejected';

export default function PauseRequestsPage() {
  const { canApprovePauseRequest } = usePermission();
  const [tab, setTab] = useState<TabKey>('pending');
  const { items, isLoading, refetch } = usePauseRequestsList({ status: tab });
  const { items: pendingOnly } = usePauseRequestsList({ status: 'pending' });
  const approveM = useApprovePauseRequest();
  const rejectM = useRejectPauseRequest();

  const [inlineRejectId, setInlineRejectId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  const columns: ColumnDef<PauseRequestRow>[] = useMemo(
    () => [
      {
        id: 'code',
        header: 'Mã yêu cầu',
        cell: ({ row }) => (
          <span className="font-mono text-xs text-[var(--text-secondary)]">{row.original.code ?? row.original.id.slice(0, 8)}</span>
        ),
      },
      {
        id: 'student',
        header: 'Học viên',
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="flex items-center gap-2">
              <Avatar name={r.studentName ?? '?'} size="sm" />
              <div>
                <p className="font-medium text-[var(--text-primary)]">{r.studentName ?? '—'}</p>
                <p className="text-xs text-[var(--text-muted)]">{r.classCode ?? r.className ?? ''}</p>
              </div>
            </div>
          );
        },
      },
      {
        id: 'sessions',
        header: 'Buổi đã học',
        cell: ({ row }) => <span>{row.original.sessionsAttended ?? '—'}</span>,
      },
      {
        id: 'reason',
        header: 'Lý do',
        cell: ({ row }) => <span className="line-clamp-2 text-[var(--text-secondary)]">{row.original.reason ?? '—'}</span>,
      },
      {
        id: 'requestedAt',
        header: 'Ngày yêu cầu',
        cell: ({ row }) => <span className="text-[var(--text-secondary)]">{row.original.requestedAt ?? '—'}</span>,
      },
      {
        id: 'status',
        header: 'Trạng thái',
        cell: ({ row }) => {
          const s = (row.original.status ?? '').toLowerCase();
          const variant =
            s === 'pending' ? 'warning' : s === 'approved' ? 'success' : s === 'rejected' ? 'danger' : 'default';
          return <Badge variant={variant}>{row.original.status}</Badge>;
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const r = row.original;
          if (tab !== 'pending') return null;
          if (!canApprovePauseRequest) {
            return <span className="text-xs text-[var(--text-muted)]">Chỉ quản trị viên duyệt</span>;
          }

          if (inlineRejectId === r.id) {
            return (
              <div className="flex min-w-[240px] flex-col gap-2 py-1">
                <label className="text-xs text-[var(--text-muted)]" htmlFor={`reject-${r.id}`}>
                  Lý do từ chối (bắt buộc)
                </label>
                <textarea
                  id={`reject-${r.id}`}
                  rows={3}
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  placeholder="Nhập lý do rõ ràng cho phụ huynh / học viên…"
                  className={cn(
                    'w-full resize-y rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-2 py-1.5 text-sm text-[var(--text-primary)]',
                    'placeholder:text-[var(--text-muted)] focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/40',
                  )}
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    isLoading={rejectM.isPending}
                    disabled={rejectNote.trim().length < 1}
                    onClick={async () => {
                      const note = rejectNote.trim();
                      if (!note) return;
                      await rejectM.mutateAsync({
                        id: r.id,
                        reviewNote: note,
                        studentId: r.studentId,
                      });
                      setInlineRejectId(null);
                      setRejectNote('');
                      void refetch();
                    }}
                  >
                    Xác nhận từ chối
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={rejectM.isPending}
                    onClick={() => {
                      setInlineRejectId(null);
                      setRejectNote('');
                    }}
                  >
                    Hủy
                  </Button>
                </div>
              </div>
            );
          }

          return (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                isLoading={approveM.isPending}
                onClick={async () => {
                  await approveM.mutateAsync({ id: r.id, studentId: r.studentId });
                  void refetch();
                }}
              >
                Duyệt
              </Button>
              <Button
                type="button"
                size="sm"
                variant="danger"
                onClick={() => {
                  setInlineRejectId(r.id);
                  setRejectNote('');
                }}
              >
                Từ chối
              </Button>
            </div>
          );
        },
      },
    ],
    [tab, approveM, rejectM, refetch, inlineRejectId, rejectNote, canApprovePauseRequest],
  );

  const pendingN = pendingOnly.length;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h1 className="text-xl font-semibold text-[var(--text-primary)]">Yêu cầu bảo lưu</h1>

      <div className="flex flex-wrap gap-1 border-b border-[var(--border-subtle)]">
        {(
          [
            ['pending', `Chờ duyệt (${pendingN})`],
            ['approved', 'Đã duyệt'],
            ['rejected', 'Từ chối'],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => {
              setTab(k);
              setInlineRejectId(null);
              setRejectNote('');
            }}
            className={cn(
              '-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors',
              tab === k
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={items}
        total={items.length}
        page={1}
        pageSize={Math.max(items.length, 1)}
        onPageChange={() => {}}
        isLoading={isLoading}
        emptyMessage="Không có yêu cầu bảo lưu nào đang chờ 🎉"
        getRowId={(r) => r.id}
        className={tab === 'pending' ? '[&_tbody_tr]:bg-amber-500/4' : undefined}
      />
    </div>
  );
}
