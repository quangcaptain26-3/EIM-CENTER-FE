import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { DataTable } from '@/shared/ui/data-table';
import { FormInput } from '@/shared/ui/form/form-input';
import { Modal } from '@/shared/ui/modal';
import { Avatar } from '@/shared/ui/avatar';
import { useReceiptsList, useVoidReceipt } from '@/presentation/hooks/finance/use-receipts';
import { useUsers } from '@/presentation/hooks/system/use-users';
import { useStudentSearchSuggestions } from '@/presentation/hooks/students/use-students';
import type { StudentSearchSuggestion } from '@/shared/types/student.type';
import { RoutePaths } from '@/app/router/route-paths';
import { formatVnd } from '@/shared/utils/format-vnd';
import { formatDate, formatDateTimeUtc7 } from '@/shared/lib/date';
import type { ReceiptRow } from '@/shared/types/finance.type';
import { cn } from '@/shared/lib/cn';
import { usePermission } from '@/presentation/hooks/use-permission';
import { Tooltip } from '@/shared/ui/tooltip';

function methodLabel(m: string) {
  if (m === 'cash') return 'Tiền mặt';
  if (m === 'transfer' || m === 'bank_transfer') return 'Chuyển khoản';
  return m;
}

const METHOD_TABS: { value: '' | 'cash' | 'transfer'; label: string }[] = [
  { value: '', label: 'Tất cả' },
  { value: 'cash', label: 'Tiền mặt' },
  { value: 'transfer', label: 'Chuyển khoản' },
];

const RECEIPT_VOID_INFO =
  'Phiếu thu không thể xóa, chỉ có thể tạo phiếu bù trừ (hủy phiếu / phiếu âm).';

export default function ReceiptListPage() {
  const navigate = useNavigate();
  const { canCreateReceipt } = usePermission();
  const [page, setPage] = useState(1);
  const limit = 20;
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'' | 'cash' | 'transfer'>('');
  const [studentSearch, setStudentSearch] = useState('');
  const [studentId, setStudentId] = useState<string | undefined>();
  const [voidId, setVoidId] = useState<string | null>(null);
  const [voidNote, setVoidNote] = useState('');

  const { users } = useUsers({ page: 1, limit: 400, isActive: true });
  const userMap = useMemo(() => Object.fromEntries(users.map((u) => [u.id, u.fullName])), [users]);

  const { students: studentSuggestions } = useStudentSearchSuggestions(
    studentSearch,
    studentSearch.trim().length >= 1,
  );

  const listParams = useMemo(
    () => ({
      page,
      limit,
      studentId,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      paymentMethod,
    }),
    [page, limit, studentId, dateFrom, dateTo, paymentMethod],
  );

  const { receipts, total, isLoading, refetch } = useReceiptsList(listParams);
  const voidM = useVoidReceipt();

  const summary = useMemo(() => {
    let totalThu = 0;
    let cash = 0;
    let transfer = 0;
    for (const r of receipts) {
      if (r.amount > 0) {
        totalThu += r.amount;
        if (r.paymentMethod === 'cash') cash += r.amount;
        else if (r.paymentMethod === 'transfer' || r.paymentMethod === 'bank_transfer') transfer += r.amount;
      }
    }
    return { count: receipts.length, totalThu, cash, transfer };
  }, [receipts]);

  const columns: ColumnDef<ReceiptRow>[] = useMemo(
    () => [
      {
        id: 'code',
        header: 'Mã phiếu',
        cell: ({ row }) => (
          <span className="font-mono text-sm text-brand-400">{row.original.receiptCode}</span>
        ),
      },
      {
        id: 'date',
        header: 'Ngày',
        cell: ({ row }) => {
          const v = row.original.paymentDate;
          if (!v) return '—';
          const s = String(v);
          return s.includes('T') ? formatDateTimeUtc7(s) : formatDate(s);
        },
      },
      {
        id: 'student',
        header: 'Học viên',
        cell: ({ row }) => {
          const r = row.original;
          const name = r.studentName?.trim() || r.payerName;
          return (
            <div className="flex items-center gap-2">
              <Avatar name={name} size="sm" />
              <span className="text-[var(--text-primary)]">{name}</span>
            </div>
          );
        },
      },
      {
        id: 'reason',
        header: 'Lý do',
        cell: ({ row }) => (
          <span className="line-clamp-2 max-w-[220px] text-[var(--text-secondary)]" title={row.original.reason}>
            {row.original.reason}
          </span>
        ),
      },
      {
        id: 'amount',
        header: 'Số tiền',
        cell: ({ row }) => {
          const a = row.original.amount;
          const neg = a < 0;
          return (
            <span className={cn('font-medium tabular-nums', neg ? 'text-red-400' : 'text-green-400')}>
              {neg ? '(Hoàn) ' : null}
              {formatVnd(Math.abs(a))}
            </span>
          );
        },
      },
      {
        id: 'method',
        header: 'Hình thức',
        cell: ({ row }) => methodLabel(String(row.original.paymentMethod)),
      },
      {
        id: 'creator',
        header: 'Người lập',
        cell: ({ row }) => {
          const id = row.original.createdBy;
          const resolved = id ? userMap[id] : undefined;
          return resolved ?? id?.slice(0, 8) ?? '—';
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-[var(--text-secondary)] hover:text-brand-400"
              aria-label="Xem"
              onClick={() => navigate(RoutePaths.RECEIPT_DETAIL.replace(':id', row.original.id))}
            >
              <Eye className="size-5" />
            </Button>
            {row.original.amount > 0 && !row.original.voidedByReceiptId ? (
              <Tooltip content={RECEIPT_VOID_INFO}>
                <span className="inline-flex">
                  <Button type="button" variant="danger" size="sm" onClick={() => setVoidId(row.original.id)}>
                    Hủy phiếu
                  </Button>
                </span>
              </Tooltip>
            ) : null}
          </div>
        ),
      },
    ],
    [navigate, userMap],
  );

  const headerTotal = useMemo(
    () => receipts.reduce((s, r) => s + (r.amount > 0 ? r.amount : 0), 0),
    [receipts],
  );

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Phiếu thu</h1>
          <span className="rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)] px-2.5 py-0.5 text-xs text-[var(--text-secondary)]">
            {total} phiếu
          </span>
          <span className="rounded-full border border-brand-500/30 bg-brand-500/10 px-2.5 py-0.5 text-sm font-medium text-brand-300">
            Tổng (trang): {formatVnd(headerTotal)}
          </span>
        </div>
        {canCreateReceipt ? (
          <Button type="button" onClick={() => navigate(RoutePaths.RECEIPT_NEW)}>
            Tạo phiếu thu
          </Button>
        ) : null}
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">
        <div className="min-w-[140px]">
          <FormInput
            label="Từ ngày"
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="min-w-[140px]">
          <FormInput
            label="Đến ngày"
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="relative min-w-[220px] flex-1 lg:max-w-md">
          <label className="mb-1 block text-xs text-[var(--text-muted)]">Học viên</label>
          <FormInput
            placeholder="Tên / mã / SĐT…"
            value={studentSearch}
            onChange={(e) => {
              setStudentSearch(e.target.value);
              setStudentId(undefined);
              setPage(1);
            }}
          />
          {studentSearch.trim().length >= 1 && studentSuggestions.length > 0 ? (
            <div className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xl">
              {studentSuggestions.map((s: StudentSearchSuggestion) => (
                <button
                  key={s.id}
                  type="button"
                  className="block w-full px-3 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                  onClick={() => {
                    setStudentId(s.id);
                    setStudentSearch(`${s.fullName} (${s.studentCode})`);
                    setPage(1);
                  }}
                >
                  {s.fullName} · {s.studentCode}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)]/50 p-0.5">
          {METHOD_TABS.map((t) => (
            <Button
              key={t.value || 'all'}
              type="button"
              size="sm"
              variant={paymentMethod === t.value ? 'primary' : 'ghost'}
              className="rounded-md"
              onClick={() => {
                setPaymentMethod(t.value);
                setPage(1);
              }}
            >
              {t.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="sticky top-0 z-10 border-y border-[var(--border-subtle)] bg-[var(--bg-base)] py-2 text-sm text-[var(--text-secondary)] backdrop-blur-md">
        {summary.count} phiếu (trang) · Tổng thu:{' '}
        <span className="font-medium text-emerald-400">{formatVnd(summary.totalThu)}</span>
        {' · '}
        Tiền mặt: <span className="text-[var(--text-primary)]">{formatVnd(summary.cash)}</span>
        {' · '}
        Chuyển khoản: <span className="text-[var(--text-primary)]">{formatVnd(summary.transfer)}</span>
      </div>

      <DataTable
        columns={columns}
        data={receipts}
        total={total}
        page={page}
        pageSize={limit}
        onPageChange={setPage}
        isLoading={isLoading}
        emptyMessage="Không có phiếu thu."
        getRowId={(r) => r.id}
      />

      <Modal
        isOpen={Boolean(voidId)}
        onClose={() => {
          setVoidId(null);
          setVoidNote('');
        }}
        title="Void phiếu thu"
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setVoidId(null);
                setVoidNote('');
              }}
              disabled={voidM.isPending}
            >
              Đóng
            </Button>
            <Button
              type="button"
              variant="danger"
              isLoading={voidM.isPending}
              onClick={async () => {
                if (!voidId) return;
                await voidM.mutateAsync({ id: voidId, body: { note: voidNote || undefined } });
                setVoidId(null);
                setVoidNote('');
                void refetch();
              }}
            >
              Xác nhận void
            </Button>
          </>
        }
      >
        <p className="text-sm text-[var(--text-secondary)]">Tạo phiếu âm bù trừ. Ghi chú (tuỳ chọn):</p>
        <FormInput
          className="mt-2"
          label="Ghi chú"
          value={voidNote}
          onChange={(e) => setVoidNote(e.target.value)}
        />
      </Modal>
    </div>
  );
}
