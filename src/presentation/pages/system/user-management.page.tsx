import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createColumnHelper } from '@tanstack/react-table';
import { Button } from '@/shared/ui/button';
import { Badge, RoleBadge } from '@/shared/ui/badge';
import { SearchBox } from '@/shared/ui/search-box';
import { Tabs, type TabItem } from '@/shared/ui/tabs';
import { DataTable } from '@/shared/ui/data-table';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { Avatar } from '@/shared/ui/avatar';
import { useUsers } from '@/presentation/hooks/system/use-users';
import { useUserRoleTabCounts } from '@/presentation/hooks/system/use-user-role-tab-counts';
import { useSoftDeleteUser, useUpdateSalary } from '@/presentation/hooks/system/use-user-mutations';
import { useAuth } from '@/presentation/hooks/auth/use-auth';
import { usePermission } from '@/presentation/hooks/use-permission';
import { CreateUserModal } from '@/presentation/components/system/create-user-modal';
import { UserModal } from '@/presentation/components/system/user-modal';
import { SalaryModal, type SalaryFormValues } from '@/presentation/components/system/salary-modal';
import { UserRowActions } from '@/presentation/components/system/user-row-actions';
import { RoutePaths } from '@/app/router/route-paths';
import { ROLES } from '@/shared/constants/roles';
import type { RoleCode } from '@/shared/types/auth.type';
import type { UserListItem, UserStatus } from '@/shared/types/user.type';
import { fmt } from '@/shared/lib/fmt';
import { formatSeniorityMonths } from '@/shared/lib/seniority';
import { cn } from '@/shared/lib/cn';

const columnHelper = createColumnHelper<UserListItem>();

type RoleTabId = 'all' | RoleCode;
type StatusTab = 'all' | 'active' | 'inactive';

function statusToIsActive(s: StatusTab): boolean | undefined {
  if (s === 'all') return undefined;
  return s === 'active';
}

function statusBadgeVariant(s: UserStatus) {
  return s === 'active' ? 'success' : ('default' as const);
}

function statusLabel(s: UserStatus) {
  return s === 'active' ? 'Hoạt động' : 'Vô hiệu';
}

export default function UserManagementPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canReplaceMainTeacher: isAdmin } = usePermission();

  const [page, setPage] = useState(1);
  const limit = 10;
  const [search, setSearch] = useState('');
  const [roleTab, setRoleTab] = useState<RoleTabId>('all');
  const [statusTab, setStatusTab] = useState<StatusTab>('all');

  const [createOpen, setCreateOpen] = useState(false);
  const [salaryUser, setSalaryUser] = useState<UserListItem | null>(null);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserListItem | null>(null);

  const isActiveFilter = statusToIsActive(statusTab);

  const countParams = useMemo(
    () => ({
      search: search || undefined,
      isActive: isActiveFilter,
    }),
    [search, isActiveFilter],
  );

  const { totalAll, byRole, isLoading: countsLoading } = useUserRoleTabCounts(countParams);

  const listParams = useMemo(
    () => ({
      page,
      limit,
      search: search || undefined,
      role: roleTab === 'all' ? ('' as const) : roleTab,
      isActive: isActiveFilter,
    }),
    [page, limit, search, roleTab, isActiveFilter],
  );

  const { users, total, isLoading, isFetching } = useUsers(listParams);
  const deleteMutation = useSoftDeleteUser();
  const updateSalary = useUpdateSalary();

  const roleTabs: TabItem[] = useMemo(
    () => [
      {
        id: 'all',
        label: 'Tất cả',
        badge: (
          <Badge variant="default" className="tabular-nums">
            {countsLoading ? '…' : totalAll}
          </Badge>
        ),
      },
      {
        id: ROLES.ADMIN,
        label: 'Giám đốc',
        badge: (
          <Badge variant="default" className="tabular-nums">
            {countsLoading ? '…' : byRole.ADMIN}
          </Badge>
        ),
      },
      {
        id: ROLES.ACADEMIC,
        label: 'Học vụ',
        badge: (
          <Badge variant="default" className="tabular-nums">
            {countsLoading ? '…' : byRole.ACADEMIC}
          </Badge>
        ),
      },
      {
        id: ROLES.ACCOUNTANT,
        label: 'Kế toán',
        badge: (
          <Badge variant="default" className="tabular-nums">
            {countsLoading ? '…' : byRole.ACCOUNTANT}
          </Badge>
        ),
      },
      {
        id: ROLES.TEACHER,
        label: 'Giáo viên',
        badge: (
          <Badge variant="default" className="tabular-nums">
            {countsLoading ? '…' : byRole.TEACHER}
          </Badge>
        ),
      },
    ],
    [totalAll, byRole, countsLoading],
  );

  const onSearch = useCallback((q: string) => {
    setPage(1);
    setSearch(q);
  }, []);

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'employee',
        header: 'Nhân viên',
        cell: (ctx) => {
          const row = ctx.row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar name={row.fullName} size="md" />
              <div className="min-w-0">
                <p className="truncate font-medium text-[var(--text-primary)]">{row.fullName}</p>
                <p className="font-mono text-xs text-[var(--text-muted)]">{row.userCode}</p>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor('roleCode', {
        header: 'Vai trò',
        cell: (c) => <RoleBadge role={c.getValue() as RoleCode} />,
      }),
      columnHelper.accessor('phone', {
        header: 'SĐT',
        cell: (c) => (
          <span className="font-mono text-sm text-[var(--text-secondary)]">{c.getValue() || '—'}</span>
        ),
      }),
      columnHelper.accessor('seniorityMonths', {
        header: 'Thâm niên',
        cell: (c) => (
          <span className="text-[var(--text-secondary)]">{formatSeniorityMonths(c.getValue() as number | null | undefined)}</span>
        ),
      }),
      columnHelper.display({
        id: 'salary',
        header: 'Lương/buổi',
        cell: (ctx) => {
          const row = ctx.row.original;
          if (row.roleCode !== 'TEACHER') return <span className="text-[var(--text-muted)]">—</span>;
          return (
            <span className="font-mono text-sm text-[var(--text-secondary)]">
              {fmt.currencyShort(row.salaryPerSession ?? null)}
            </span>
          );
        },
      }),
      columnHelper.accessor('status', {
        header: 'Trạng thái',
        cell: (c) => {
          const s = c.getValue() as UserStatus;
          return (
            <Badge variant={statusBadgeVariant(s)} dot>
              {statusLabel(s)}
            </Badge>
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: (ctx) => (
          <UserRowActions
            row={ctx.row.original}
            isAdmin={isAdmin}
            currentUserId={user?.id}
            onEdit={(row) => setEditUserId(row.id)}
            onChangeSalary={(row) => setSalaryUser(row)}
            onDelete={(row) => setDeleteTarget(row)}
          />
        ),
      }),
    ],
    [isAdmin, user?.id],
  );

  const onSalarySubmit = async (values: SalaryFormValues) => {
    if (!salaryUser) return;
    await updateSalary.mutateAsync({
      id: salaryUser.id,
      data: {
        salaryPerSession: values.salaryPerSession,
        reason: values.reason,
      },
    });
    setSalaryUser(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-xl font-semibold text-[var(--text-primary)]">Nhân sự</h1>
          <Badge variant="brand" className="tabular-nums">
            {total}
          </Badge>
        </div>
        {isAdmin ? (
          <Button type="button" onClick={() => setCreateOpen(true)}>
            Thêm nhân viên
          </Button>
        ) : null}
      </div>

      <div className="space-y-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">
        <SearchBox
          placeholder="Tìm theo tên, mã nhân sự, email…"
          onSearch={onSearch}
          isLoading={isFetching && !isLoading}
        />

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">Vai trò</p>
          <Tabs
            variant="pills"
            tabs={roleTabs}
            activeTab={roleTab}
            onChange={(id) => {
              setPage(1);
              setRoleTab(id as RoleTabId);
            }}
          />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">Trạng thái</p>
          <div className="flex flex-wrap gap-2">
            {(['all', 'active', 'inactive'] as const).map((s) => (
              <Button
                key={s}
                type="button"
                size="sm"
                variant={statusTab === s ? 'primary' : 'outline'}
                className={cn(statusTab === s && 'pointer-events-none')}
                onClick={() => {
                  setPage(1);
                  setStatusTab(s);
                }}
              >
                {s === 'all' ? 'Tất cả' : s === 'active' ? 'Hoạt động' : 'Vô hiệu'}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={users}
        total={total}
        page={page}
        pageSize={limit}
        onPageChange={setPage}
        isLoading={isLoading}
        onRowClick={(row) => navigate(RoutePaths.USER_DETAIL.replace(':id', row.id))}
        getRowId={(r) => r.id}
      />

      <CreateUserModal isOpen={createOpen} onClose={() => setCreateOpen(false)} canEditSalary={isAdmin} />

      <UserModal
        isOpen={Boolean(editUserId)}
        onClose={() => setEditUserId(null)}
        mode="edit"
        userId={editUserId}
        canEditSalary={isAdmin}
      />

      <SalaryModal
        isOpen={!!salaryUser}
        onClose={() => setSalaryUser(null)}
        initialSalaryPerSession={salaryUser?.salaryPerSession}
        initialAllowance={salaryUser?.allowance}
        onSubmit={onSalarySubmit}
        isSubmitting={updateSalary.isPending}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Vô hiệu nhân viên"
        message={
          deleteTarget
            ? `Vô hiệu (xóa mềm) nhân viên “${deleteTarget.fullName}” (${deleteTarget.userCode})?`
            : ''
        }
        confirmLabel="Vô hiệu"
        loading={deleteMutation.isPending}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteMutation.mutateAsync(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
