import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { FormSelect } from '@/shared/ui/form/form-select';
import { Avatar } from '@/shared/ui/avatar';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import {
  PayrollPreviewTable,
  type PayrollPreviewTableRow,
} from '@/presentation/components/finance/payroll-preview-table';
import { Skeleton, SkeletonTable, SkeletonText } from '@/shared/ui/skeleton';
import { usePayrollPreview, useFinalizePayroll } from '@/presentation/hooks/finance/use-payroll';
import { useUsers } from '@/presentation/hooks/system/use-users';
import { ROLES } from '@/shared/constants/roles';
import { usePermission } from '@/presentation/hooks/use-permission';
import { RoutePaths } from '@/app/router/route-paths';
import { formatVnd } from '@/shared/utils/format-vnd';
import type { PayrollPreviewData } from '@/shared/types/finance.type';
import type { PayrollRecord } from '@/shared/types/api-contract';
import { cn } from '@/shared/lib/cn';
import { ChevronDown } from 'lucide-react';

function buildRows(
  sessions: PayrollPreviewData['sessionsAsMain'],
  kind: PayrollPreviewTableRow['kind'],
): PayrollPreviewTableRow[] {
  return sessions.map((s) => ({ ...s, kind }));
}

function PreviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5 sm:flex-row sm:items-center">
        <Skeleton className="size-12 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-full max-w-md" />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)]/50 p-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-2 h-8 w-12" />
          </div>
        ))}
      </div>
      <SkeletonText lines={4} />
      <SkeletonTable rows={5} columns={3} />
    </div>
  );
}

export default function PayrollFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { canFinalizePayroll } = usePermission();
  const [teacherId, setTeacherId] = useState('');
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const cy = now.getFullYear();
  const [year, setYear] = useState(cy);
  const [step, setStep] = useState<1 | 2>(1);

  // Điều hướng từ màn "Chờ chốt" — query ?teacherId=&month=&year= ; đổi param: sửa payroll-list navigate tương ứng.
  useEffect(() => {
    const tid = searchParams.get('teacherId');
    const m = searchParams.get('month');
    const y = searchParams.get('year');
    if (tid) setTeacherId(tid);
    if (m) {
      const mn = Number(m);
      if (mn >= 1 && mn <= 12) setMonth(mn);
    }
    if (y) {
      const yn = Number(y);
      if (yn >= 2000 && yn <= 2100) setYear(yn);
    }
    if (tid && m && y) setStep(2);
  }, [searchParams]);
  const [sessionsOpen, setSessionsOpen] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { users: teachers } = useUsers({ page: 1, limit: 200, role: ROLES.TEACHER, isActive: true });
  const teacherOptions = useMemo(
    () => [{ value: '', label: 'Chọn giáo viên' }, ...teachers.map((t) => ({ value: t.id, label: t.fullName }))],
    [teachers],
  );

  const monthOptions = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        value: String(i + 1),
        label: `Tháng ${i + 1}`,
      })),
    [],
  );

  const yearOptions = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => {
        const y = cy - 2 + i;
        return { value: String(y), label: String(y) };
      }),
    [cy],
  );

  const selectedTeacher = useMemo(() => teachers.find((t) => t.id === teacherId), [teachers, teacherId]);

  const { preview, isLoading } = usePayrollPreview(
    step === 2 ? teacherId : undefined,
    step === 2 ? month : undefined,
    step === 2 ? year : undefined,
  );

  const rowsMain = useMemo(
    () => (preview && !preview.alreadyFinalized ? buildRows(preview.sessionsAsMain, 'main') : []),
    [preview],
  );
  const rowsCover = useMemo(
    () => (preview && !preview.alreadyFinalized ? buildRows(preview.sessionsAsCover, 'cover') : []),
    [preview],
  );
  const rowsCovered = useMemo(
    () => (preview && !preview.alreadyFinalized ? buildRows(preview.sessionsCovered, 'covered') : []),
    [preview],
  );
  const finalizeM = useFinalizePayroll();

  const runPreview = () => {
    if (!teacherId) return;
    setStep(2);
  };

  const sessionsProduct = preview
    ? preview.salaryPerSession * (preview.sessionsAsMain.length + preview.sessionsAsCover.length)
    : 0;

  const onFinalize = async () => {
    if (!teacherId || !preview || preview.alreadyFinalized) return;
    try {
      const record = (await finalizeM.mutateAsync({ teacherId, month, year })) as PayrollRecord;
      const code = record.payrollCode ?? '';
      const id = record.id;
      setConfirmOpen(false);
      toast.success(`Đã chốt lương thành công · Mã: ${code}`);
      navigate(RoutePaths.PAYROLL_DETAIL.replace(':id', id));
    } catch {
      setConfirmOpen(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-6">
      <h1 className="mb-6 font-display text-xl font-semibold text-[var(--text-primary)]">Chốt lương giáo viên</h1>

      <div className="mb-8 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'flex size-8 items-center justify-center rounded-full border-2 text-sm font-medium',
              step >= 1 ? 'border-brand-500 bg-brand-500/20 text-brand-200' : 'border-[var(--border-strong)] text-[var(--text-muted)]',
            )}
          >
            1
          </span>
          <span className={cn('text-sm', step === 1 ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]')}>Chọn GV & kỳ</span>
        </div>
        <div className="h-px flex-1 bg-[var(--bg-elevated)]" />
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'flex size-8 items-center justify-center rounded-full border-2 text-sm font-medium',
              step >= 2 ? 'border-brand-500 bg-brand-500/20 text-brand-200' : 'border-[var(--border-strong)] text-[var(--text-muted)]',
            )}
          >
            2
          </span>
          <span className={cn('text-sm', step === 2 ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]')}>Preview & chốt</span>
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6">
          <p className="text-sm font-medium text-[var(--text-primary)]">Bước 1 — Chọn giáo viên và tháng/năm</p>
          <FormSelect
            label="Giáo viên"
            name="teacher"
            options={teacherOptions}
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
          />
          <div className="flex flex-wrap gap-4">
            <FormSelect
              label="Tháng"
              name="month"
              options={monthOptions}
              value={String(month)}
              onChange={(e) => setMonth(Number(e.target.value))}
            />
            <FormSelect
              label="Năm"
              name="year"
              options={yearOptions}
              value={String(year)}
              onChange={(e) => setYear(Number(e.target.value))}
            />
          </div>
          <Button type="button" disabled={!teacherId} onClick={runPreview}>
            Xem preview
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" variant="secondary" onClick={() => setStep(1)}>
              ← Quay lại
            </Button>
            <span className="text-sm text-[var(--text-secondary)]">
              {selectedTeacher?.fullName ?? teacherId} · {String(month).padStart(2, '0')}/{year}
            </span>
          </div>

          {step === 2 && isLoading && !preview ? (
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">
              <p className="mb-4 text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">Đang tải preview…</p>
              <PreviewSkeleton />
            </div>
          ) : null}

          {preview?.alreadyFinalized ? (
            <div className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-4 text-sm text-amber-100/95">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="warning" className="text-[11px] font-normal">
                  Đã chốt tháng {month}/{year}
                </Badge>
              </div>
              <p className="mt-2 font-semibold text-amber-50">
                Đã chốt lương tháng {month}/{year} cho {selectedTeacher?.fullName ?? 'giáo viên'}.
              </p>
              <p className="mt-2 text-amber-200/90">
                {preview.finalizedPayrollId ? (
                  <Link
                    to={RoutePaths.PAYROLL_DETAIL.replace(':id', preview.finalizedPayrollId)}
                    className="font-medium text-amber-300 underline underline-offset-2 hover:text-amber-200"
                  >
                    Xem chi tiết
                  </Link>
                ) : (
                  <Link to={RoutePaths.PAYROLL} className="font-medium text-amber-300 underline">
                    Xem danh sách bảng lương
                  </Link>
                )}
              </p>
            </div>
          ) : null}

          {preview && !preview.alreadyFinalized && (
            <>
              <div className="flex flex-col gap-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5 sm:flex-row sm:items-start">
                <Avatar name={selectedTeacher?.fullName ?? 'GV'} size="lg" />
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="text-lg font-semibold text-[var(--text-primary)]">{selectedTeacher?.fullName ?? '—'}</p>
                  <p className="font-mono text-sm text-[var(--text-muted)]">{selectedTeacher?.userCode ?? teacherId}</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Lương hiện tại:{' '}
                    <span className="tabular-nums font-medium text-[var(--text-primary)]">{formatVnd(preview.salaryPerSession)}</span>
                    /buổi · Phụ cấp:{' '}
                    <span className="tabular-nums font-medium text-[var(--text-primary)]">{formatVnd(preview.allowance)}</span>
                  </p>
                  <p className="text-xs leading-relaxed text-[var(--text-muted)]">
                    Giá trị này sẽ được snapshot khi chốt — thay đổi sau chốt không ảnh hưởng bảng lương đã khóa.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-4">
                <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)]/50 p-3">
                  <p className="text-xs text-[var(--text-muted)]">Tổng buổi</p>
                  <p className="mt-1 text-xl font-semibold text-[var(--text-primary)]">{preview.sessionsCount}</p>
                </div>
                <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)]/50 p-3">
                  <p className="text-xs text-[var(--text-muted)]">Buổi chính</p>
                  <p className="mt-1 text-xl font-semibold text-blue-400">{preview.sessionsAsMain.length}</p>
                </div>
                <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)]/50 p-3">
                  <p className="text-xs text-[var(--text-muted)]">Buổi cover</p>
                  <p className="mt-1 text-xl font-semibold text-amber-400">{preview.sessionsAsCover.length}</p>
                </div>
                <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)]/50 p-3">
                  <p className="text-xs text-[var(--text-muted)]">Buổi bị cover</p>
                  <p className="mt-1 text-xl font-semibold text-[var(--text-secondary)]">{preview.sessionsCovered.length}</p>
                  <p className="mt-1 text-[11px] text-[var(--text-muted)]">(không tính lương)</p>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-[var(--border-subtle)]">
                <table className="min-w-full text-sm">
                  <thead className="bg-[var(--bg-surface)] text-left text-[var(--text-secondary)]">
                    <tr>
                      <th className="px-4 py-2 font-medium">Buổi chính</th>
                      <th className="px-4 py-2 font-medium">Đi cover</th>
                      <th className="px-4 py-2 font-medium">Bị cover</th>
                      <th className="px-4 py-2 font-medium">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-[var(--border-subtle)]">
                      <td className="px-4 py-3 tabular-nums text-blue-300">{preview.sessionsAsMain.length}</td>
                      <td className="px-4 py-3 tabular-nums text-amber-300">{preview.sessionsAsCover.length}</td>
                      <td className="px-4 py-3 tabular-nums text-[var(--text-secondary)]">{preview.sessionsCovered.length}</td>
                      <td className="px-4 py-3">
                        <Badge variant={preview.alreadyFinalized ? 'warning' : 'default'}>
                          {preview.alreadyFinalized ? 'Đã chốt' : 'Chưa chốt'}
                        </Badge>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] p-4">
                <p className="text-sm text-[var(--text-secondary)]">
                  {preview.sessionsCount} buổi × {formatVnd(preview.salaryPerSession)} ={' '}
                  <span className="tabular-nums font-medium text-[var(--text-primary)]">{formatVnd(sessionsProduct)}</span>
                </p>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  + Phụ cấp: <span className="tabular-nums text-[var(--text-primary)]">{formatVnd(preview.allowance)}</span>
                </p>
                <div className="my-3 h-px bg-[var(--bg-elevated)]" />
                <p className="font-display text-2xl font-semibold text-brand-500">
                  = Tổng: {formatVnd(preview.totalSalary)}
                </p>
              </div>

              <div className="overflow-hidden rounded-xl border border-[var(--border-subtle)]">
                <button
                  type="button"
                  className="flex w-full items-center justify-between bg-[var(--bg-surface)] px-4 py-2 text-left text-sm font-medium text-[var(--text-primary)]"
                  onClick={() => setSessionsOpen((o) => !o)}
                >
                  Chi tiết buổi (theo hiệu lực lương)
                  <ChevronDown className={cn('size-4 transition', sessionsOpen && 'rotate-180')} />
                </button>
                {sessionsOpen ? (
                  <div className="space-y-6 border-t border-[var(--border-subtle)] p-4">
                    <div>
                      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-300/90">
                        Buổi dạy chính (tính lương)
                      </h3>
                      <PayrollPreviewTable rows={rowsMain} className="border-0" />
                    </div>
                    <div>
                      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-300/90">
                        Buổi đi cover (tính lương)
                      </h3>
                      <PayrollPreviewTable rows={rowsCover} className="border-0" />
                    </div>
                    <div>
                      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                        Buổi bị người khác cover <span className="font-normal">(không tính lương)</span>
                      </h3>
                      <PayrollPreviewTable rows={rowsCovered} className="border-0" />
                    </div>
                  </div>
                ) : null}
              </div>

              {canFinalizePayroll ? (
                <Button
                  type="button"
                  onClick={() => setConfirmOpen(true)}
                  disabled={finalizeM.isPending}
                  isLoading={finalizeM.isPending}
                >
                  Chốt lương
                </Button>
              ) : null}
            </>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        variant="warning"
        title="Xác nhận chốt lương"
        message={
          preview && selectedTeacher
            ? `Bạn sắp chốt lương ${month}/${year} cho ${selectedTeacher.fullName}.
Buổi chính: ${preview.sessionsAsMain.length}
Đi cover: ${preview.sessionsAsCover.length}
Bị cover: ${preview.sessionsCovered.length}
Lương/buổi snapshot khi chốt: ${formatVnd(preview.salaryPerSession)}
Phụ cấp: ${formatVnd(preview.allowance)}
Tổng ước tính: ${formatVnd(preview.totalSalary)}
Sau khi chốt sẽ không thể chỉnh sửa.`
            : ''
        }
        confirmLabel="Chốt lương"
        onConfirm={onFinalize}
        loading={finalizeM.isPending}
      />
    </div>
  );
}
