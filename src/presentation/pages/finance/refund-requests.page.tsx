import { memo, useCallback, useMemo, useState, useTransition } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { useAuth } from '@/presentation/hooks/auth/use-auth';
import { useRefundRequests } from '@/presentation/hooks/finance/use-refund-requests';
import { RefundApproveModal } from '@/presentation/components/finance/refund-approve-modal';
import { RefundRejectModal } from '@/presentation/components/finance/refund-reject-modal';
import { ROLES } from '@/shared/constants/roles';
import { formatVnd } from '@/shared/utils/format-vnd';
import type { RefundRequestRow } from '@/shared/types/finance.type';
import { cn } from '@/shared/lib/cn';
import { toast } from 'sonner';

const columnHelper = createColumnHelper<RefundRequestRow>();

type TabKey = 'pending' | 'approved' | 'rejected';

function reasonBadge(reasonType: string) {
  if (reasonType === 'center_unable_to_open') {
    return <Badge variant="warning">Trung tâm</Badge>;
  }
  if (reasonType === 'special_case') {
    return <Badge variant="info">Đặc biệt</Badge>;
  }
  return <Badge variant="default">Cá nhân</Badge>;
}

function statusTabLabel(s: string): string {
  const m: Record<string, string> = {
    pending: 'Chờ duyệt',
    approved: 'Đã duyệt',
    rejected: 'Từ chối',
  };
  return m[s] ?? s;
}

const RefundRowActions = memo(function RefundRowActions({
  onApprove,
  onReject,
}: {
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <div className="flex gap-2">
      <Button type="button" size="sm" onClick={onApprove}>
        Duyệt
      </Button>
      <Button type="button" size="sm" variant="danger" onClick={onReject}>
        Từ chối
      </Button>
    </div>
  );
});

export default function RefundRequestsPage() {
  const { role } = useAuth();
  const isAdmin = role === ROLES.ADMIN;
  const [tab, setTab] = useState<TabKey>('pending');
  const [, startTransition] = useTransition();

  const { items, isLoading, isFetching, listParams } = useRefundRequests({
    limit: 50,
    status: tab,
  });

  const [approveId, setApproveId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);

  const openApprove = useCallback(
    (row: RefundRequestRow) => {
      if ((row.refundAmount ?? 0) <= 0) {
        toast.error('Không thể duyệt: số tiền hoàn phí bằng 0. Kiểm tra lại yêu cầu hoặc dùng trường hợp đặc biệt.');
        return;
      }
      startTransition(() => setApproveId(row.id));
    },
    [startTransition],
  );
  const openReject = useCallback(
    (id: string) => startTransition(() => setRejectId(id)),
    [startTransition],
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor('requestCode', {
        header: 'Mã',
        cell: (c) => <span className="font-mono text-xs text-brand-300">{c.getValue()}</span>,
      }),
      columnHelper.display({
        id: 'student',
        header: 'Học viên',
        cell: (ctx) => ctx.row.original.studentName ?? '—',
      }),
      columnHelper.accessor('reasonType', {
        header: 'Loại',
        cell: (c) => reasonBadge(String(c.getValue())),
      }),
      columnHelper.accessor('reasonDetail', {
        header: 'Chi tiết',
        cell: (c) => <span className="line-clamp-2 max-w-xs text-[var(--text-secondary)]">{String(c.getValue())}</span>,
      }),
      columnHelper.accessor('refundAmount', {
        header: 'Số hoàn',
        cell: (c) => <span className="tabular-nums text-[var(--text-primary)]">{formatVnd(Number(c.getValue()))}</span>,
      }),
      columnHelper.accessor('createdAt', {
        header: 'Ngày',
        cell: (c) => {
          const v = c.getValue();
          return v ? new Date(String(v)).toLocaleDateString('vi-VN') : '—';
        },
      }),
      columnHelper.accessor('status', {
        header: 'Trạng thái',
        cell: (c) => <span className="text-[var(--text-secondary)]">{statusTabLabel(String(c.getValue()))}</span>,
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: (ctx) => {
          const pending = ctx.row.original.status === 'pending';
          if (!pending || !isAdmin) return null;
          return (
            <RefundRowActions
              onApprove={() => openApprove(ctx.row.original)}
              onReject={() => openReject(ctx.row.original.id)}
            />
          );
        },
      }),
    ],
    [isAdmin, openApprove, openReject],
  );

  const table = useReactTable({ data: items, columns, getCoreRowModel: getCoreRowModel() });

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'pending', label: 'Chờ duyệt' },
    { key: 'approved', label: 'Đã duyệt' },
    { key: 'rejected', label: 'Từ chối' },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Yêu cầu hoàn phí</h1>
        {isFetching && !isLoading ? (
          <span className="text-xs text-[var(--text-muted)]">Đang đồng bộ…</span>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-0.5">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              tab === t.key ? 'bg-brand-500 text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]',
            )}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
        <table className="min-w-full divide-y divide-[var(--border-subtle)] text-sm">
          <thead className="bg-[var(--bg-surface)]">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]"
                  >
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-[var(--text-muted)]">
                  Đang tải…
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-[var(--text-muted)]">
                  Không có yêu cầu
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-[var(--bg-elevated)]/40">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-[var(--text-primary)]">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <RefundApproveModal
        requestId={approveId}
        listParams={listParams}
        onClose={() => setApproveId(null)}
      />
      <RefundRejectModal requestId={rejectId} listParams={listParams} onClose={() => setRejectId(null)} />
      </div>
  );
}
