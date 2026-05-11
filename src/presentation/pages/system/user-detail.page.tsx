import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { Badge, RoleBadge } from '@/shared/ui/badge';
import { Tabs, type TabItem } from '@/shared/ui/tabs';
import { Avatar } from '@/shared/ui/avatar';
import { getSalaryLogs, getUser } from '@/infrastructure/services/users.api';
import { QUERY_KEYS } from '@/infrastructure/query/query-keys';
import { parseSalaryLogs, parseStaffUserDetail } from '@/infrastructure/services/user-detail.util';
import { RoutePaths } from '@/app/router/route-paths';
import { useAuth } from '@/presentation/hooks/auth/use-auth';
import { useUpdateSalary } from '@/presentation/hooks/system/use-user-mutations';
import { UserModal } from '@/presentation/components/system/user-modal';
import { SalaryModal, type SalaryFormValues } from '@/presentation/components/system/salary-modal';
import { formatDate } from '@/shared/lib/date';
import { formatDateTime } from '@/shared/lib/date';
import { formatSenioritySinceStartDate } from '@/shared/lib/seniority';
import { fmt } from '@/shared/lib/fmt';
import { formatVnd } from '@/shared/utils/format-vnd';
import type { RoleCode } from '@/shared/types/auth.type';
import type { StaffUserDetail, UserStatus } from '@/shared/types/user.type';
import { cn } from '@/shared/lib/cn';
import { PlaceholderText } from '@/shared/ui/placeholder-text';
import { ExpandableText } from '@/shared/ui/expandable-text';

type DetailTab = 'personal' | 'job' | 'salary';

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs font-medium text-[var(--text-muted)]">{label}</p>
      <p className="mt-0.5 text-sm text-[var(--text-primary)]">
        <PlaceholderText value={value} />
      </p>
    </div>
  );
}

function CardSection({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5 shadow-sm',
        className,
      )}
    >
      <h3 className="mb-4 font-display text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function statusLabel(s: UserStatus) {
  return s === 'active' ? 'Hoạt động' : 'Vô hiệu';
}

function salaryPair(
  from: number | null | undefined,
  to: number | null | undefined,
): string {
  return `${fmt.currencyShort(from ?? null)} → ${fmt.currencyShort(to ?? null)}`;
}

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();
  const isAdmin = role === 'ADMIN';

  const [tab, setTab] = useState<DetailTab>('personal');
  const [editOpen, setEditOpen] = useState(false);
  const [salaryOpen, setSalaryOpen] = useState(false);

  useEffect(() => {
    if (!isAdmin && tab === 'salary') setTab('personal');
  }, [isAdmin, tab]);

  const userQuery = useQuery({
    queryKey: QUERY_KEYS.USERS.detail(id ?? ''),
    queryFn: () => getUser(id!),
    enabled: Boolean(id),
  });

  const salaryLogsQuery = useQuery({
    queryKey: QUERY_KEYS.USERS.salaryLogs(id ?? ''),
    queryFn: () => getSalaryLogs(id!),
    enabled: Boolean(id) && isAdmin,
  });

  const user = useMemo(() => parseStaffUserDetail(userQuery.data), [userQuery.data]);
  const logs = useMemo(() => parseSalaryLogs(salaryLogsQuery.data), [salaryLogsQuery.data]);

  const updateSalary = useUpdateSalary();

  const tabs: TabItem[] = useMemo(() => {
    const base: TabItem[] = [
      { id: 'personal', label: 'Thông tin cá nhân' },
      { id: 'job', label: 'Công tác' },
    ];
    if (isAdmin) base.push({ id: 'salary', label: 'Lịch sử lương' });
    return base;
  }, [isAdmin]);

  const onSalaryModalSubmit = async (values: SalaryFormValues) => {
    if (!id) return;
    await updateSalary.mutateAsync({
      id,
      data: {
        salaryPerSession: values.salaryPerSession,
        reason: values.reason,
      },
    });
    setSalaryOpen(false);
    void userQuery.refetch();
    void salaryLogsQuery.refetch();
  };

  if (userQuery.isLoading || !id) {
    return <p className="text-sm text-[var(--text-muted)]">Đang tải…</p>;
  }

  if (!user) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[var(--text-secondary)]">Không tìm thấy nhân viên.</p>
        <Button type="button" variant="secondary" onClick={() => navigate(RoutePaths.USERS)}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const u = user as StaffUserDetail;
  const st = (u.status ?? 'active') as UserStatus;

  return (
    <div className="space-y-6">
      <Button type="button" variant="ghost" size="sm" className="-ml-2 text-[var(--text-secondary)]" onClick={() => navigate(RoutePaths.USERS)}>
        ← Danh sách
      </Button>

      <div className="flex flex-col gap-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar name={u.fullName} size="lg" />
          <div className="min-w-0 space-y-2">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-[var(--text-primary)]">{u.fullName}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="default" className="font-mono text-xs text-[var(--text-secondary)]">
                {u.userCode}
              </Badge>
              <RoleBadge role={u.roleCode as RoleCode} />
              <Badge variant={st === 'active' ? 'success' : 'default'} dot>
                {statusLabel(st)}
              </Badge>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">{formatSenioritySinceStartDate(u.startDate)}</p>
          </div>
        </div>
        {isAdmin ? (
          <Button type="button" onClick={() => setEditOpen(true)}>
            Chỉnh sửa
          </Button>
        ) : null}
      </div>

      <Tabs variant="underline" tabs={tabs} activeTab={tab} onChange={(t) => setTab(t as DetailTab)} />

      <div className="min-h-[200px]">
        {tab === 'personal' ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <CardSection title="Cá nhân">
              <Field label="Giới tính" value={u.gender} />
              <Field label="Ngày sinh" value={u.dob ? formatDate(u.dob) : null} />
              <Field label="Email" value={u.email} />
              <Field label="SĐT" value={u.phone} />
              <div className="sm:col-span-2">
                <Field label="Địa chỉ" value={u.address} />
              </div>
            </CardSection>
            <CardSection title="Pháp lý">
              <Field label="CCCD" value={u.cccd} />
              <Field label="Quốc tịch" value={u.nationality} />
              <Field label="Dân tộc" value={u.ethnicity} />
              <Field label="Tôn giáo" value={u.religion} />
            </CardSection>
          </div>
        ) : null}

        {tab === 'job' ? (
          <CardSection title="Công tác" className="lg:max-w-3xl">
            <Field label="Mã nhân viên" value={u.userCode} />
            <Field label="Vai trò" value={u.roleCode} />
            <Field label="Trình độ" value={u.educationLevel} />
            <Field label="Chuyên ngành" value={u.major} />
            <Field label="Ngày vào làm" value={u.startDate ? formatDate(u.startDate) : null} />
            <Field
              label="Thâm niên (tháng)"
              value={u.seniorityMonths != null ? String(u.seniorityMonths) : null}
            />
          </CardSection>
        ) : null}

        {tab === 'salary' && isAdmin ? (
          <div className="space-y-6">
            {u.roleCode === 'TEACHER' ? (
              <>
                <div className="rounded-2xl border border-brand-500/20 bg-brand-500/5 p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">Lương / buổi</p>
                      <p className="mt-1 font-display text-3xl font-semibold text-[var(--text-primary)]">
                        {formatVnd(Number(u.salaryPerSession ?? 0))}
                      </p>
                      <p className="mt-2 text-sm text-[var(--text-secondary)]">
                        Phụ cấp: <span className="text-[var(--text-primary)]">{formatVnd(Number(u.allowance ?? 0))}</span>
                      </p>
                      <p className="mt-3 text-sm text-[var(--text-muted)]">
                        Tổng ước tính / tháng (~8 buổi):{' '}
                        <span className="font-semibold text-[var(--text-primary)]">
                          {formatVnd(
                            Math.round(
                              (Number(u.salaryPerSession ?? 0) + Number(u.allowance ?? 0)) * 8,
                            ),
                          )}
                        </span>
                      </p>
                    </div>
                    <Button type="button" onClick={() => setSalaryOpen(true)}>
                      Điều chỉnh lương
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 font-display text-sm font-semibold text-[var(--text-primary)]">
                    Lịch sử điều chỉnh ({logs.length})
                  </h3>
                  <div className="relative space-y-0 pl-6 before:absolute before:left-2 before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-[var(--bg-overlay)]">
                    {salaryLogsQuery.isLoading ? (
                      <p className="text-sm text-[var(--text-muted)]">Đang tải lịch sử lương…</p>
                    ) : null}
                    {logs.map((log) => (
                      <div key={log.id} className="relative pb-6 last:pb-0">
                        <span className="absolute -left-1 top-1.5 size-2.5 rounded-full bg-brand-500 ring-4 ring-[var(--bg-base)]" />
                        <p className="text-xs text-[var(--text-muted)]">{formatDateTime(log.changedAt)}</p>
                        <p className="mt-1 text-sm text-[var(--text-primary)]">
                          Lương/buổi: {salaryPair(log.previousSalaryPerSession, log.salaryPerSession)} · Phụ cấp:{' '}
                          {salaryPair(log.previousAllowance, log.allowance)}
                        </p>
                        <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                          Người sửa: <PlaceholderText value={log.changedByName} className="text-xs" />
                        </p>
                        {log.reason?.trim() ? (
                          <div className="mt-2 max-w-xl">
                            <ExpandableText text={log.reason} className="text-sm text-[var(--text-secondary)]" />
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                  {logs.length === 0 && !salaryLogsQuery.isLoading ? (
                    <p className="text-sm text-[var(--text-muted)]">Chưa có lịch sử thay đổi lương.</p>
                  ) : null}
                </div>
              </>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">Lương chỉ hiển thị với giáo viên.</p>
            )}
          </div>
        ) : null}
      </div>

      <UserModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        mode="edit"
        user={u}
        canEditSalary={isAdmin}
      />

      <SalaryModal
        isOpen={salaryOpen}
        onClose={() => setSalaryOpen(false)}
        initialSalaryPerSession={u.salaryPerSession}
        initialAllowance={u.allowance}
        onSubmit={onSalaryModalSubmit}
        isSubmitting={updateSalary.isPending}
      />
    </div>
  );
}
