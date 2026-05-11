import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import { FormInput } from '@/shared/ui/form/form-input';
import { Avatar } from '@/shared/ui/avatar';
import { useFinanceDashboard } from '@/presentation/hooks/finance/use-finance';
import { getDashboard } from '@/infrastructure/services/finance.api';
import { QUERY_KEYS } from '@/infrastructure/query/query-keys';
import { parseFinanceDashboard } from '@/infrastructure/services/finance-parse.util';
import { FinanceProgramBarChart, FinanceTrendAreaChart } from '@/presentation/components/finance/finance-dashboard-charts';
import { currencyShort, formatVnd } from '@/shared/utils/format-vnd';
import { RoutePaths } from '@/app/router/route-paths';
import { cn } from '@/shared/lib/cn';

function last6Months(year: number, month: number) {
  const out: { y: number; m: number }[] = [];
  let y = year;
  let m = month;
  for (let i = 0; i < 6; i++) {
    out.unshift({ y, m });
    m -= 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
  }
  return out;
}

function monthTickLabel(m: number): string {
  return `Th.${m}`;
}

function KpiCard({
  title,
  value,
  sub,
  danger,
}: {
  title: string;
  value: string;
  sub?: ReactNode;
  danger?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border p-5 shadow-sm',
        danger ? 'border-red-500/30 bg-red-500/5' : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)]',
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">{title}</p>
      <p className={cn('mt-2 font-display text-2xl font-semibold', danger ? 'text-red-400' : 'text-[var(--text-primary)]')}>
        {value}
      </p>
      {sub ? <div className="mt-1 text-xs text-[var(--text-muted)]">{sub}</div> : null}
    </div>
  );
}

export default function FinanceDashboardPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const { dashboard, isLoading } = useFinanceDashboard({ year, month });

  const six = useMemo(() => last6Months(year, month), [year, month]);

  const chartQueries = useQueries({
    queries: six.map(({ y, m }) => ({
      queryKey: QUERY_KEYS.FINANCE.dashboard({ month: m, year: y }),
      queryFn: () => getDashboard({ month: m, year: y }),
      staleTime: 60_000,
    })),
  });

  const chartData = useMemo(() => {
    return six.map(({ y, m }, i) => {
      const raw = chartQueries[i]?.data;
      const d = raw ? parseFinanceDashboard(raw) : null;
      return {
        label: monthTickLabel(m),
        cashBasis: d?.cashBasis ?? 0,
        accrualBasis: d?.accrualBasis ?? 0,
        meta: `${String(m).padStart(2, '0')}/${y}`,
      };
    });
  }, [six, chartQueries]);

  const trend = dashboard?.cashTrendPercent;
  const totalDebt = dashboard?.totalDebt ?? null;
  const receiptCount = dashboard?.receiptCount ?? null;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h1 className="text-xl font-semibold text-[var(--text-primary)]">Dashboard tài chính</h1>

      <div className="flex flex-wrap items-end gap-4">
        <div className="w-32">
          <FormInput
            label="Tháng"
            type="number"
            min={1}
            max={12}
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          />
        </div>
        <div className="w-36">
          <FormInput
            label="Năm"
            type="number"
            min={2000}
            max={2100}
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          />
        </div>
      </div>

      {isLoading || !dashboard ? (
        <p className="text-[var(--text-muted)]">Đang tải…</p>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              title="Thực thu tháng này"
              value={currencyShort(dashboard.cashBasis)}
              sub={
                trend != null && Number.isFinite(trend) ? (
                  <span className="inline-flex items-center gap-1 text-emerald-400">
                    <TrendingUp className="size-3.5" />
                    {trend >= 0 ? '+' : ''}
                    {trend.toFixed(1)}% so kỳ trước
                  </span>
                ) : (
                  <span>Kỳ: {dashboard.period || `${month}/${year}`}</span>
                )
              }
            />
            <KpiCard title="Học phí phát sinh" value={currencyShort(dashboard.accrualBasis)} />
            <KpiCard
              title="Học phí chưa thu"
              value={totalDebt != null ? currencyShort(totalDebt) : '—'}
              danger={totalDebt != null && totalDebt > 0}
            />
            <KpiCard title="Số phiếu thu" value={receiptCount != null ? String(receiptCount) : '—'} />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 lg:col-span-2">
              <h2 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Xu hướng 6 tháng</h2>
              <FinanceTrendAreaChart data={chartData} />
            </div>
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">
              <h2 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Theo chương trình</h2>
              {dashboard.byProgram?.length ? (
                <FinanceProgramBarChart byProgram={dashboard.byProgram} />
              ) : (
                <p className="py-12 text-center text-sm text-[var(--text-muted)]">Chưa có dữ liệu</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Enrollments tháng</h3>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-semibold text-[var(--text-primary)]">{dashboard.newEnrollments}</p>
                  <p className="text-[11px] text-[var(--text-muted)]">Mới</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-emerald-400">{dashboard.completions}</p>
                  <p className="text-[11px] text-[var(--text-muted)]">Hoàn thành</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-amber-400">{dashboard.drops}</p>
                  <p className="text-[11px] text-[var(--text-muted)]">Bỏ học</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Top học phí còn lại</h3>
              <ul className="mt-3 space-y-2">
                {(dashboard.topDebtors ?? []).slice(0, 5).map((r) => (
                  <li key={r.studentId} className="flex items-center justify-between gap-2 text-sm">
                    <Link
                      to={RoutePaths.STUDENT_DETAIL.replace(':id', r.studentId)}
                      className="flex min-w-0 items-center gap-2 text-[var(--text-primary)] hover:text-brand-400"
                    >
                      <Avatar name={r.studentName} size="sm" />
                      <span className="truncate">{r.studentName}</span>
                    </Link>
                    <span className="shrink-0 tabular-nums text-red-400">{formatVnd(r.debt)}</span>
                  </li>
                ))}
                {!(dashboard.topDebtors && dashboard.topDebtors.length) ? (
                  <li className="text-sm text-[var(--text-muted)]">Không có dữ liệu</li>
                ) : null}
              </ul>
            </div>

            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Việc cần xử lý</h3>
              <ul className="mt-3 space-y-3 text-sm">
                <li>
                  <Link to={RoutePaths.REFUND_REQUESTS} className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-brand-400">
                    <AlertTriangle className="size-4 text-amber-400" />
                    Hoàn phí chờ
                    {dashboard.pendingRefundCount != null ? (
                      <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs text-amber-300">
                        {dashboard.pendingRefundCount}
                      </span>
                    ) : null}
                  </Link>
                </li>
                <li>
                  <Link to={RoutePaths.PAUSE_REQUESTS} className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-brand-400">
                    <AlertTriangle className="size-4 text-sky-400" />
                    Bảo lưu chờ
                    {dashboard.pendingPauseCount != null ? (
                      <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-xs text-sky-300">
                        {dashboard.pendingPauseCount}
                      </span>
                    ) : null}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
