import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';
import { AlertTriangle, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/ui/button';
import { DataTable } from '@/shared/ui/data-table';
import { FormSelect } from '@/shared/ui/form/form-select';
import { Avatar } from '@/shared/ui/avatar';
import { usePaymentStatusList } from '@/presentation/hooks/finance/use-finance';
import { exportDebtReport } from '@/infrastructure/services/finance.api';
import { useParsedPrograms, useClassesList } from '@/presentation/hooks/classes/use-classes';
import { formatVnd } from '@/shared/utils/format-vnd';
import type { PaymentStatusRow } from '@/shared/types/finance.type';
import { RoutePaths } from '@/app/router/route-paths';
import { cn } from '@/shared/lib/cn';
import { usePermission } from '@/presentation/hooks/use-permission';
import { formatDate } from '@/shared/lib/date';

export default function PaymentStatusPage() {
  const { canCreateReceipt, canExportDebtReport } = usePermission();
  const [page, setPage] = useState(1);
  const limit = 50;
  const [onlyDebt, setOnlyDebt] = useState(true);
  const [classId, setClassId] = useState('');
  const [programId, setProgramId] = useState('');
  const [exporting, setExporting] = useState(false);

  const { programs } = useParsedPrograms();
  const programOptions = useMemo(
    () => [{ value: '', label: 'Tất cả CT' }, ...programs.map((p) => ({ value: p.id, label: p.name }))],
    [programs],
  );

  const { classes } = useClassesList({
    page: 1,
    limit: 300,
    programId: programId || undefined,
    status: 'active',
  });
  const classOptions = useMemo(
    () => [{ value: '', label: programId ? 'Tất cả lớp' : 'Chọn CT trước' }, ...classes.map((c) => ({ value: c.id, label: c.classCode }))],
    [classes, programId],
  );

  const listParams = useMemo(
    () => ({
      page,
      limit,
      hasDebt: onlyDebt ? true : undefined,
      classId: classId || undefined,
      programId: programId || undefined,
    }),
    [page, limit, onlyDebt, classId, programId],
  );

  const { rows, total, isLoading, refetch } = usePaymentStatusList(listParams);

  const pageDebtSum = useMemo(() => rows.reduce((s, r) => s + (r.debt > 0 ? r.debt : 0), 0), [rows]);

  const columns: ColumnDef<PaymentStatusRow>[] = useMemo(
    () => [
      {
        id: 'student',
        header: 'Học sinh',
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="flex min-w-0 items-center gap-2">
              <Avatar name={r.studentName} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-[var(--text-primary)]">{r.studentName}</p>
                {r.parentPhone ? (
                  <p className="truncate font-mono text-xs text-[var(--text-muted)]">{r.parentPhone}</p>
                ) : null}
              </div>
            </div>
          );
        },
      },
      {
        id: 'class',
        header: 'Lớp',
        cell: ({ row }) => (
          <span className="text-[var(--text-secondary)]">{row.original.classCode ?? row.original.classId.slice(0, 8)}</span>
        ),
      },
      {
        accessorKey: 'tuitionFee',
        header: 'Học phí',
        cell: ({ getValue }) => <span className="tabular-nums text-[var(--text-primary)]">{formatVnd(Number(getValue()))}</span>,
      },
      {
        accessorKey: 'totalPaid',
        header: 'Đã đóng',
        cell: ({ getValue }) => <span className="tabular-nums text-[var(--text-primary)]">{formatVnd(Number(getValue()))}</span>,
      },
      {
        accessorKey: 'debt',
        header: 'Còn lại',
        cell: ({ row }) => {
          const d = row.original.debt;
          const danger = d > 0;
          return (
            <div className="flex flex-col items-start gap-1">
              <span
                className={cn(
                  'inline-flex items-center gap-1 font-medium tabular-nums',
                  danger ? 'text-red-400' : d < 0 ? 'text-blue-400' : 'text-green-400',
                )}
              >
                {danger ? <AlertTriangle className="size-3.5 shrink-0" aria-hidden /> : null}
                {formatVnd(d)}
              </span>
              {row.original.isDebtOver30Days ? (
                <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[11px] font-medium text-red-300">
                  Học phí quá hạn 30 ngày
                </span>
              ) : null}
            </div>
          );
        },
      },
      {
        id: 'enrolledAt',
        header: 'Ngày ghi danh',
        cell: ({ row }) => (
          <span className="text-[var(--text-secondary)]">
            {row.original.enrolledAt ? formatDate(row.original.enrolledAt.slice(0, 10)) : '—'}
          </span>
        ),
      },
      {
        id: 'parentPhone',
        header: 'SĐT PH',
        cell: ({ row }) => (
          <span className="font-mono text-xs text-[var(--text-secondary)]">{row.original.parentPhone ?? '—'}</span>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const r = row.original;
          const href = `${RoutePaths.RECEIPT_NEW}?studentId=${encodeURIComponent(r.studentId)}&enrollmentId=${encodeURIComponent(r.enrollmentId)}`;
          if (!canCreateReceipt) return <span className="text-xs text-[var(--text-muted)]">—</span>;
          return (
            <Button type="button" variant="secondary" size="sm" asChild>
              <Link to={href}>Tạo phiếu thu nhanh</Link>
            </Button>
          );
        },
      },
    ],
    [canCreateReceipt],
  );

  const downloadExport = async () => {
    setExporting(true);
    let loadingId: string | number | undefined;
    try {
      const blob = await exportDebtReport(
        {
          hasDebt: onlyDebt ? true : undefined,
          classId: classId || undefined,
          programId: programId || undefined,
        },
        {
          onJobStarted: () => {
            loadingId = toast.loading('Đang xuất dữ liệu…');
          },
        },
      );
      if (loadingId !== undefined) toast.dismiss(loadingId);
      const filename = `hoc-phi-chua-thu-${new Date().toISOString().slice(0, 10)}.xlsx`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Đã tải file');
    } catch {
      if (loadingId !== undefined) toast.dismiss(loadingId);
      toast.error('Không tải được file xuất');
    } finally {
      setExporting(false);
    }
  };

  const totalDebtMillions = pageDebtSum / 1_000_000;

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Học phí còn lại</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            <span className="font-medium text-[var(--text-primary)]">{total}</span> bản ghi (theo bộ lọc) · Tổng học phí còn lại trên trang:{' '}
            <span className="font-medium text-red-400">{totalDebtMillions.toFixed(1)} triệu</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={() => void refetch()}>
            Làm mới
          </Button>
          {canExportDebtReport ? (
            <Button
              type="button"
              isLoading={exporting}
              onClick={() => void downloadExport()}
              leftIcon={<Download className="size-4" strokeWidth={1.5} aria-hidden />}
            >
              Xuất báo cáo
            </Button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text-secondary)]">
          <input
            type="checkbox"
            className="rounded border-[var(--border-strong)]"
            checked={onlyDebt}
            onChange={(e) => {
              setOnlyDebt(e.target.checked);
              setPage(1);
            }}
          />
          Chỉ hiện còn học phí chưa thu
        </label>
        <div className="min-w-[180px]">
          <FormSelect
            label="Chương trình"
            name="program"
            options={programOptions}
            value={programId}
            onChange={(e) => {
              setProgramId(e.target.value);
              setClassId('');
              setPage(1);
            }}
          />
        </div>
        <div className="min-w-[180px]">
          <FormSelect
            label="Lớp"
            name="class"
            options={classOptions}
            value={classId}
            onChange={(e) => {
              setClassId(e.target.value);
              setPage(1);
            }}
            disabled={!programId}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        total={total}
        page={page}
        pageSize={limit}
        onPageChange={setPage}
        isLoading={isLoading}
        emptyMessage="Không có bản ghi."
        getRowId={(r) => r.enrollmentId}
      />
    </div>
  );
}
