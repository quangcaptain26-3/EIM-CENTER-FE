import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';
import { Download, Eye } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { DataTable } from '@/shared/ui/data-table';
import { FormInput } from '@/shared/ui/form/form-input';
import { FormSelect } from '@/shared/ui/form/form-select';
import { Avatar } from '@/shared/ui/avatar';
import { usePayrollsList, useUnfinalizedPayrolls } from '@/presentation/hooks/finance/use-payroll';
import { useUsers } from '@/presentation/hooks/system/use-users';
import { RoutePaths } from '@/app/router/route-paths';
import { ROLES } from '@/shared/constants/roles';
import { formatVnd } from '@/shared/utils/format-vnd';
import type { PayrollListRow } from '@/shared/types/finance.type';
import { cn } from '@/shared/lib/cn';
import { usePermission } from '@/presentation/hooks/use-permission';
import { Badge } from '@/shared/ui/badge';

type PayrollListMode = 'finalized' | 'pending';

export default function PayrollListPage() {
  const navigate = useNavigate();
  const { canFinalizePayroll } = usePermission();
  const now = new Date();
  const [page, setPage] = useState(1);
  const limit = 30;
  const [listMode, setListMode] = useState<PayrollListMode>('finalized');
  const [month, setMonth] = useState<number | ''>('');
  const [year, setYear] = useState<number | ''>('');
  const [pendingMonth, setPendingMonth] = useState<number>(now.getMonth() + 1);
  const [pendingYear, setPendingYear] = useState<number>(now.getFullYear());
  const [teacherId, setTeacherId] = useState('');
  const [teacherSearch, setTeacherSearch] = useState('');

  const { users: teachers } = useUsers({ page: 1, limit: 200, role: ROLES.TEACHER, status: 'active' });
  const { users: allUsers } = useUsers({ page: 1, limit: 400, status: 'active' });
  const nameMap = useMemo(() => Object.fromEntries(allUsers.map((u) => [u.id, u.fullName])), [allUsers]);

  const teacherOptions = useMemo(
    () => [{ value: '', label: 'Tất cả GV' }, ...teachers.map((t) => ({ value: t.id, label: t.fullName }))],
    [teachers],
  );

  const listParams = useMemo(
    () => ({
      page,
      limit,
      teacherId: teacherId || undefined,
      month: month === '' ? undefined : Number(month),
      year: year === '' ? undefined : Number(year),
    }),
    [page, limit, teacherId, month, year],
  );

  const pendingListParams = useMemo(
    () => ({
      page,
      limit,
      month: pendingMonth,
      year: pendingYear,
      teacherId: teacherId || undefined,
    }),
    [page, limit, teacherId, pendingMonth, pendingYear],
  );

  const finalizedQ = usePayrollsList(listParams);
  const pendingQ = useUnfinalizedPayrolls(pendingListParams);
  const { payrolls, total, isLoading } = listMode === 'finalized' ? finalizedQ : pendingQ;

  const filtered = useMemo(() => {
    const q = teacherSearch.trim().toLowerCase();
    if (!q) return payrolls;
    return payrolls.filter((p) => (nameMap[p.teacherId] ?? '').toLowerCase().includes(q));
  }, [payrolls, teacherSearch, nameMap]);

  const pageTotal = useMemo(() => filtered.reduce((s, p) => s + p.totalSalary, 0), [filtered]);

  const columns: ColumnDef<PayrollListRow>[] = useMemo(
    () => [
      {
        id: 'period',
        header: 'Tháng',
        cell: ({ row }) =>
          `${String(row.original.periodMonth).padStart(2, '0')}/${row.original.periodYear}`,
      },
      {
        id: 'teacher',
        header: 'Giáo viên',
        cell: ({ row }) => {
          const id = row.original.teacherId;
          const name = nameMap[id] ?? id.slice(0, 8);
          return (
            <div className="flex items-center gap-2">
              <Avatar name={name} size="sm" />
              <span className="text-[var(--text-primary)]">{name}</span>
            </div>
          );
        },
      },
      { accessorKey: 'sessionsCount', header: 'Số buổi' },
      {
        accessorKey: 'salaryPerSessionSnapshot',
        header: 'Lương/buổi',
        cell: ({ getValue }) => <span className="tabular-nums">{formatVnd(Number(getValue()))}</span>,
      },
      {
        accessorKey: 'allowanceSnapshot',
        header: 'Phụ cấp',
        cell: ({ getValue }) => <span className="tabular-nums">{formatVnd(Number(getValue()))}</span>,
      },
      {
        accessorKey: 'totalSalary',
        header: 'Tổng',
        cell: ({ getValue }) => (
          <span className="font-medium tabular-nums text-brand-300">{formatVnd(Number(getValue()))}</span>
        ),
      },
      {
        accessorKey: 'finalizedAt',
        header: 'Ngày chốt',
        cell: ({ getValue }) => {
          const v = getValue();
          return v ? new Date(String(v)).toLocaleString('vi-VN') : '—';
        },
      },
      {
        id: 'status',
        header: 'Trạng thái',
        cell: ({ row }) =>
          row.original.isPending ? (
            <Badge variant="warning">Chờ chốt</Badge>
          ) : (
            <Badge variant="success">Đã chốt</Badge>
          ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            {row.original.isPending ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-brand-400 hover:text-brand-300"
                aria-label="Mở chốt lương"
                onClick={() =>
                  navigate(
                    `${RoutePaths.PAYROLL_NEW}?teacherId=${encodeURIComponent(row.original.teacherId)}&month=${row.original.periodMonth}&year=${row.original.periodYear}`,
                  )
                }
              >
                <Eye className="size-5" />
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-[var(--text-secondary)] hover:text-brand-400"
                  aria-label="Chi tiết"
                  onClick={() => navigate(RoutePaths.PAYROLL_DETAIL.replace(':id', row.original.id))}
                >
                  <Eye className="size-5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-[var(--text-secondary)]"
                  aria-label="Xem để in / PDF"
                  onClick={() => navigate(RoutePaths.PAYROLL_DETAIL.replace(':id', row.original.id))}
                >
                  <Download className="size-5" />
                </Button>
              </>
            )}
          </div>
        ),
      },
    ],
    [nameMap, navigate, listMode],
  );

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Bảng lương</h1>
        {canFinalizePayroll ? (
          <Button type="button" onClick={() => navigate(RoutePaths.PAYROLL_NEW)}>
            Chốt lương mới
          </Button>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3">
        <Button
          type="button"
          variant={listMode === 'finalized' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => {
            setListMode('finalized');
            setPage(1);
          }}
        >
          Đã chốt
        </Button>
        <Button
          type="button"
          variant={listMode === 'pending' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => {
            setListMode('pending');
            setPage(1);
          }}
        >
          Chờ chốt
        </Button>
        {listMode === 'pending' ? (
          <p className="w-full text-xs text-[var(--text-muted)]">
            Hiển thị giáo viên có buổi tính lương trong tháng nhưng chưa có bản chốt — chọn tháng/năm kỳ lương.
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">
        {listMode === 'finalized' ? (
          <>
            <div className="w-36">
              <FormInput
                label="Tháng"
                type="number"
                min={1}
                max={12}
                value={month === '' ? '' : month}
                onChange={(e) => {
                  setMonth(e.target.value === '' ? '' : Number(e.target.value));
                  setPage(1);
                }}
              />
            </div>
            <div className="w-32">
              <FormInput
                label="Năm"
                type="number"
                value={year === '' ? '' : year}
                onChange={(e) => {
                  setYear(e.target.value === '' ? '' : Number(e.target.value));
                  setPage(1);
                }}
              />
            </div>
          </>
        ) : (
          <>
            <div className="w-36">
              <FormInput
                label="Tháng kỳ lương"
                type="number"
                min={1}
                max={12}
                value={pendingMonth}
                onChange={(e) => {
                  setPendingMonth(Number(e.target.value) || 1);
                  setPage(1);
                }}
              />
            </div>
            <div className="w-32">
              <FormInput
                label="Năm"
                type="number"
                value={pendingYear}
                onChange={(e) => {
                  setPendingYear(Number(e.target.value) || pendingYear);
                  setPage(1);
                }}
              />
            </div>
          </>
        )}
        <div className="min-w-[200px]">
          <FormSelect
            label="Giáo viên"
            name="tid"
            options={teacherOptions}
            value={teacherId}
            onChange={(e) => {
              setTeacherId(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="min-w-[180px] flex-1">
          <FormInput
            label="Tìm tên GV (trang hiện tại)"
            value={teacherSearch}
            onChange={(e) => setTeacherSearch(e.target.value)}
            placeholder="Lọc nhanh…"
          />
        </div>
      </div>

      <div
        className={cn(
          'sticky top-0 z-10 border-y border-[var(--border-subtle)] bg-[var(--bg-base)] py-2 text-sm text-[var(--text-secondary)] backdrop-blur-md',
        )}
      >
        Tổng lương (dòng hiển thị): <span className="font-semibold text-brand-400">{formatVnd(pageTotal)}</span>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        total={teacherSearch.trim() ? filtered.length : total}
        page={teacherSearch.trim() ? 1 : page}
        pageSize={limit}
        onPageChange={setPage}
        isLoading={isLoading}
        emptyMessage={listMode === 'pending' ? 'Không có giáo viên chờ chốt trong kỳ này.' : 'Chưa có bản chốt lương.'}
        getRowId={(r) => r.id}
      />
    </div>
  );
}
