import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Printer, Download } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import {
  PayrollPreviewTable,
  type PayrollPreviewTableRow,
} from '@/presentation/components/finance/payroll-preview-table';
import { usePayrollDetail } from '@/presentation/hooks/finance/use-payroll';
import { useUsers } from '@/presentation/hooks/system/use-users';
import { Avatar } from '@/shared/ui/avatar';
import { formatVnd } from '@/shared/utils/format-vnd';
import { RoutePaths } from '@/app/router/route-paths';

export default function PayrollDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = usePayrollDetail(id);
  const { users } = useUsers({ page: 1, limit: 400, status: 'active' });
  const nameMap = useMemo(() => Object.fromEntries(users.map((u) => [u.id, u.fullName])), [users]);
  const userCodeMap = useMemo(() => Object.fromEntries(users.map((u) => [u.id, u.userCode])), [users]);

  const rows: PayrollPreviewTableRow[] = useMemo(() => {
    if (!data?.details.length) return [];
    return data.details.map((d) => ({
      sessionId: d.sessionId,
      sessionDate: d.sessionDate,
      classCode: d.classCode,
      effectiveTeacherId: '',
      wasCover: d.wasCover,
      kind: d.wasCover ? 'cover' : 'main',
    }));
  }, [data]);

  if (isLoading || !data) {
    return (
      <div className="p-6">
        <p className="text-[var(--text-muted)]">{isLoading ? 'Đang tải…' : 'Không tìm thấy.'}</p>
        <Button type="button" variant="secondary" className="mt-4" onClick={() => navigate(RoutePaths.PAYROLL)}>
          Về danh sách
        </Button>
      </div>
    );
  }

  const { payroll: p } = data;
  const teacherName = nameMap[p.teacherId] ?? p.teacherId;

  return (
    <div className="payroll-print-root space-y-6 p-4 md:p-6 print:bg-white print:p-6">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .payroll-print-root { color: #18181b; background: #fff; }
          .payroll-print-root table { border-color: #e4e4e7 !important; }
        }
      `}</style>

      <div className="no-print flex flex-wrap items-center gap-3">
        <Button type="button" variant="secondary" onClick={() => navigate(RoutePaths.PAYROLL)}>
          ← Danh sách
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => window.print()}
          leftIcon={<Printer className="size-4" strokeWidth={1.5} aria-hidden />}
        >
          In
        </Button>
        <Button
          type="button"
          onClick={() => window.print()}
          leftIcon={<Download className="size-4" strokeWidth={1.5} aria-hidden />}
        >
          Tải PDF (in → PDF)
        </Button>
      </div>

      <header className="flex flex-col gap-3 border-b border-[var(--border-subtle)] pb-4 print:border-zinc-300 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-[var(--text-primary)] print:text-zinc-900">
            Bảng lương tháng {String(p.periodMonth).padStart(2, '0')}/{p.periodYear} · {teacherName}
          </h1>
          <p className="mt-1 font-mono text-sm text-[var(--text-muted)] print:text-[var(--text-muted)]">{userCodeMap[p.teacherId] ?? '—'}</p>
        </div>
        <span className="inline-flex w-fit rounded-full border border-brand-500/40 bg-brand-500/10 px-3 py-1 font-mono text-sm text-brand-300 print:border-zinc-300 print:bg-zinc-100 print:text-zinc-800">
          {p.payrollCode}
        </span>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5 print:border-zinc-300 print:bg-zinc-50">
          <div className="flex items-center gap-3">
            <Avatar name={teacherName} size="lg" />
            <div>
              <p className="font-medium text-[var(--text-primary)] print:text-zinc-900">{teacherName}</p>
              <p className="text-xs text-[var(--text-muted)]">{p.finalizedAt ? `Chốt: ${new Date(String(p.finalizedAt)).toLocaleString('vi-VN')}` : '—'}</p>
            </div>
          </div>
          <dl className="grid gap-2 text-sm text-[var(--text-secondary)] print:text-zinc-800">
            <div className="flex justify-between gap-4">
              <dt>Số buổi</dt>
              <dd className="tabular-nums font-medium">{p.sessionsCount}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Lương/buổi (snapshot)</dt>
              <dd className="tabular-nums">{formatVnd(p.salaryPerSessionSnapshot)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Phụ cấp</dt>
              <dd className="tabular-nums">{formatVnd(p.allowanceSnapshot)}</dd>
            </div>
            <div className="mt-2 border-t border-[var(--border-subtle)] pt-3 print:border-zinc-300">
              <div className="flex justify-between gap-4">
                <dt className="font-display text-base font-semibold text-[var(--text-primary)] print:text-zinc-900">Tổng</dt>
                <dd className="font-display text-lg font-semibold text-brand-400 tabular-nums print:text-brand-700">
                  {formatVnd(p.totalSalary)}
                </dd>
              </div>
            </div>
          </dl>
        </div>

        <div className="min-h-[200px] rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)]/30 p-2 print:border-zinc-300">
          <h2 className="mb-2 px-2 text-sm font-semibold text-[var(--text-primary)] print:text-zinc-900">Chi tiết buổi</h2>
          <PayrollPreviewTable rows={rows} />
        </div>
      </div>
    </div>
  );
}
