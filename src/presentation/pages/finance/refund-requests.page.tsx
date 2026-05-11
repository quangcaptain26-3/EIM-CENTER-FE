import { useMemo, useState } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Button } from '@/shared/ui/button';
import { Modal } from '@/shared/ui/modal';
import { FormInput } from '@/shared/ui/form/form-input';
import { Badge } from '@/shared/ui/badge';
import { useAuth } from '@/presentation/hooks/auth/use-auth';
import {
  useApproveRefundRequest,
  useRefundRequestsList,
  useRejectRefundRequest,
} from '@/presentation/hooks/finance/use-refund-requests';
import { ROLES } from '@/shared/constants/roles';
import { formatVnd } from '@/shared/utils/format-vnd';
import type { RefundRequestRow } from '@/shared/types/finance.type';
import { cn } from '@/shared/lib/cn';

const columnHelper = createColumnHelper<RefundRequestRow>();

type TabKey = 'pending' | 'approved' | 'rejected';

function reasonBadge(reasonType: string) {
  if (reasonType === 'center_unable_to_open') {
    return <Badge className="border-amber-500/40 bg-amber-500/15 text-amber-200">Trung tâm</Badge>;
  }
  if (reasonType === 'special_case') {
    return <Badge className="border-sky-500/40 bg-sky-500/15 text-sky-200">Đặc biệt</Badge>;
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

export default function RefundRequestsPage() {
  const { role } = useAuth();
  const isAdmin = role === ROLES.ADMIN;
  const [tab, setTab] = useState<TabKey>('pending');

  const { items, isLoading, refetch } = useRefundRequestsList({
    limit: 200,
    status: tab,
  });

  const approveM = useApproveRefundRequest();
  const rejectM = useRejectRefundRequest();

  const [approveId, setApproveId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [approveNote, setApproveNote] = useState('');
  const [approvedAmountStr, setApprovedAmountStr] = useState('');
  const [rejectNote, setRejectNote] = useState('');

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
            <div className="flex gap-2">
              <Button type="button" size="sm" onClick={() => setApproveId(ctx.row.original.id)}>
                Duyệt
              </Button>
              <Button type="button" size="sm" variant="danger" onClick={() => setRejectId(ctx.row.original.id)}>
                Từ chối
              </Button>
            </div>
          );
        },
      }),
    ],
    [isAdmin],
  );

  const table = useReactTable({ data: items, columns, getCoreRowModel: getCoreRowModel() });

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'pending', label: 'Chờ duyệt' },
    { key: 'approved', label: 'Đã duyệt' },
    { key: 'rejected', label: 'Từ chối' },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h1 className="text-xl font-semibold text-[var(--text-primary)]">Yêu cầu hoàn phí</h1>

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

      <Modal
        isOpen={Boolean(approveId)}
        onClose={() => {
          setApproveId(null);
          setApproveNote('');
          setApprovedAmountStr('');
        }}
        title="Duyệt hoàn phí"
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setApproveId(null)} disabled={approveM.isPending}>
              Hủy
            </Button>
            <Button
              type="button"
              isLoading={approveM.isPending}
              onClick={async () => {
                if (!approveId) return;
                const raw = approvedAmountStr.replace(/\D/g, '');
                const approvedAmount = raw ? Number(raw) : undefined;
                await approveM.mutateAsync({
                  id: approveId,
                  reviewNote: approveNote.trim() || '—',
                  approvedAmount,
                });
                setApproveId(null);
                setApproveNote('');
                setApprovedAmountStr('');
                void refetch();
              }}
            >
              Duyệt
            </Button>
          </>
        }
      >
        <p className="mb-2 text-sm text-[var(--text-secondary)]">Số tiền hoàn thực tế (tuỳ chọn, để trống = theo hệ thống)</p>
        <FormInput
          value={approvedAmountStr}
          onChange={(e) => setApprovedAmountStr(e.target.value)}
          placeholder="VD: 1500000"
          className="mb-3"
        />
        <p className="mb-2 text-sm text-[var(--text-secondary)]">Ghi chú duyệt</p>
        <FormInput value={approveNote} onChange={(e) => setApproveNote(e.target.value)} placeholder="Ghi chú" />
      </Modal>

      <Modal
        isOpen={Boolean(rejectId)}
        onClose={() => {
          setRejectId(null);
          setRejectNote('');
        }}
        title="Từ chối hoàn phí"
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setRejectId(null)} disabled={rejectM.isPending}>
              Hủy
            </Button>
            <Button
              type="button"
              variant="danger"
              isLoading={rejectM.isPending}
              disabled={!rejectNote.trim()}
              onClick={async () => {
                if (!rejectId) return;
                await rejectM.mutateAsync({ id: rejectId, reviewNote: rejectNote.trim() });
                setRejectId(null);
                setRejectNote('');
                void refetch();
              }}
            >
              Từ chối
            </Button>
          </>
        }
      >
        <p className="mb-2 text-sm text-[var(--text-secondary)]">Lý do từ chối (bắt buộc)</p>
        <FormInput value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} placeholder="Nhập lý do" />
      </Modal>
    </div>
  );
}
