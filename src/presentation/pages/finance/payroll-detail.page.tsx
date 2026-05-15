import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Printer, Download } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import {
  PayrollPreviewTable,
  type PayrollPreviewTableRow,
} from '@/presentation/components/finance/payroll-preview-table';
import {
  FinanceDocActions,
  FinanceDocHeader,
  FinanceDocPrintStyle,
  FinanceDocRoot,
  FinanceDocStatRow,
} from '@/presentation/components/finance/finance-document';
import { usePayrollDetail } from '@/presentation/hooks/finance/use-payroll';
import { useUsers } from '@/presentation/hooks/system/use-users';
import { Avatar } from '@/shared/ui/avatar';
import { formatVndAmount } from '@/shared/utils/format-vnd';
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
  const periodTitle = `Bảng lương tháng ${String(p.periodMonth).padStart(2, '0')}/${p.periodYear}`;
  const metaLine = userCodeMap[p.teacherId] ?? undefined;

  return (
    <FinanceDocRoot>
      <FinanceDocPrintStyle />

      <FinanceDocActions className="gap-3">
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
      </FinanceDocActions>

      <FinanceDocHeader title={periodTitle} docCode={p.payrollCode} metaLine={metaLine} />

      {/* Một khung duy nhất: tránh lưới 2 cột + bảng min-w 640px làm lệch / cắt nội dung */}
      <div className="w-full min-w-0 space-y-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5 print:border-zinc-300 print:bg-white">
        <div className="flex flex-wrap items-center gap-3 border-b border-[var(--border-subtle)] pb-4 print:border-zinc-200">
          <Avatar name={teacherName} size="lg" />
          <div className="min-w-0">
            <p className="font-medium text-[var(--text-primary)] print:text-zinc-900">{teacherName}</p>
            <p className="text-xs text-[var(--text-muted)]">
              {p.finalizedAt ? `Chốt: ${new Date(String(p.finalizedAt)).toLocaleString('vi-VN')}` : '—'}
            </p>
          </div>
        </div>

        <div className="w-full max-w-xl space-y-0">
          <FinanceDocStatRow label="Số buổi" value={String(p.sessionsCount)} />
          <FinanceDocStatRow label="Lương/buổi (snapshot)" value={formatVndAmount(p.salaryPerSessionSnapshot)} />
          <FinanceDocStatRow label="Phụ cấp" value={formatVndAmount(p.allowanceSnapshot)} />
          <FinanceDocStatRow label="Tổng" value={formatVndAmount(p.totalSalary)} variant="total" />
        </div>

        <div className="min-w-0 border-t border-[var(--border-subtle)] pt-4 print:border-zinc-200">
          <h2 className="mb-3 text-sm font-semibold text-[var(--text-primary)] print:text-zinc-900">Chi tiết buổi</h2>
          <PayrollPreviewTable rows={rows} embedInDocument />
        </div>
      </div>
    </FinanceDocRoot>
  );
}
