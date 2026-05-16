import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/shared/ui/button';
import { DataTable } from '@/shared/ui/data-table';
import { useMakeupSessionsList, useCompleteMakeupSession, useCancelMakeupSession } from '@/presentation/hooks/students/use-makeup-sessions';
import type { MakeupSessionRow } from '@/shared/types/student.type';
import { SessionBadge } from '@/shared/ui/badge';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { cn } from '@/shared/lib/cn';

const FILTER_TABS: { value: '' | 'pending' | 'completed' | 'cancelled'; label: string }[] = [
  { value: '', label: 'Tất cả' },
  { value: 'pending', label: 'Chờ bù' },
  { value: 'completed', label: 'Đã bù' },
  { value: 'cancelled', label: 'Đã hủy' },
];

export default function MakeupSessionsPage() {
  const [status, setStatus] = useState<'' | 'pending' | 'completed' | 'cancelled'>('');
  const [cancelTarget, setCancelTarget] = useState<MakeupSessionRow | null>(null);
  const listParams = useMemo(() => (status ? { status } : {}), [status]);
  const { items, isLoading, refetch } = useMakeupSessionsList(listParams);
  const completeM = useCompleteMakeupSession();
  const cancelM = useCancelMakeupSession();

  const columns: ColumnDef<MakeupSessionRow>[] = useMemo(
    () => [
      {
        id: 'code',
        header: 'Mã',
        cell: ({ row }) => (
          <span className="font-mono text-xs text-[var(--text-secondary)]">{row.original.code ?? row.original.id.slice(0, 8)}</span>
        ),
      },
      {
        id: 'student',
        header: 'Học viên',
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-[var(--text-primary)]">{row.original.studentName ?? '—'}</p>
            <p className="font-mono text-xs text-[var(--text-muted)]">{row.original.studentCode ?? ''}</p>
          </div>
        ),
      },
      {
        id: 'orig',
        header: 'Buổi vắng gốc',
        cell: ({ row }) => {
          const r = row.original;
          return (
            <span>
              #{r.originalSessionNo ?? '—'} · {r.originalDate?.slice(0, 10) ?? '—'}
            </span>
          );
        },
      },
      {
        id: 'scheduled',
        header: 'Ngày bù',
        cell: ({ row }) => <span>{row.original.scheduledDate?.slice(0, 10) ?? '—'}</span>,
      },
      {
        id: 'room',
        header: 'Phòng',
        cell: ({ row }) => row.original.roomName ?? '—',
      },
      {
        id: 'teacher',
        header: 'GV',
        cell: ({ row }) => row.original.teacherName ?? '—',
      },
      {
        id: 'status',
        header: 'Trạng thái',
        cell: ({ row }) => <SessionBadge status={row.original.status} />,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const r = row.original;
          const pending = r.status === 'pending';
          if (!pending) return null;
          return (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                disabled={completeM.isPending}
                onClick={async () => {
                  await completeM.mutateAsync(r.id);
                  void refetch();
                }}
              >
                Hoàn thành
              </Button>
              <Button
                type="button"
                size="sm"
                variant="danger"
                disabled={cancelM.isPending}
                onClick={() => setCancelTarget(r)}
              >
                Hủy
              </Button>
            </div>
          );
        },
      },
    ],
    [completeM, cancelM, refetch],
  );

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Học bù</h1>
        <div className="flex flex-wrap gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-0.5">
          {FILTER_TABS.map((t) => (
            <Button
              key={t.value || 'all'}
              type="button"
              size="sm"
              variant={status === t.value ? 'primary' : 'ghost'}
              className={cn('rounded-md')}
              onClick={() => setStatus(t.value)}
            >
              {t.label}
            </Button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={items}
        total={items.length}
        page={1}
        pageSize={Math.max(items.length, 1)}
        onPageChange={() => {}}
        isLoading={isLoading}
        emptyMessage="Không có buổi học bù."
        getRowId={(r) => r.id}
      />

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        variant="danger"
        title="Hủy buổi học bù"
        message={
          cancelTarget
            ? `Bạn có chắc muốn hủy buổi học bù của ${cancelTarget.studentName ?? 'học viên này'}${cancelTarget.scheduledDate ? ` (ngày ${cancelTarget.scheduledDate.slice(0, 10)})` : ''}? Hành động này không thể hoàn tác.`
            : ''
        }
        confirmLabel="Hủy buổi bù"
        cancelLabel="Đóng"
        loading={cancelM.isPending}
        onConfirm={async () => {
          if (!cancelTarget) return;
          try {
            await cancelM.mutateAsync(cancelTarget.id);
            setCancelTarget(null);
            void refetch();
          } catch {
            /* toast / error từ hook nếu có */
          }
        }}
      />
    </div>
  );
}
