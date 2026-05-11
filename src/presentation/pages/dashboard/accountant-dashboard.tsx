import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Banknote, CircleDollarSign, ReceiptText, UserRoundX } from 'lucide-react';
import { RoutePaths } from '@/app/router/route-paths';
import { fmt } from '@/shared/lib/fmt';
import type { DashboardStats } from '@/shared/types/dashboard-stats.type';
import { KpiCard } from '@/presentation/pages/dashboard/components/kpi-card';
import { RevenueChart } from '@/presentation/pages/dashboard/components/revenue-chart';

const PIE_COLORS = ['#2563eb', '#7c3aed', '#0891b2', '#d97706', '#64748b'];

export function AccountantDashboardView({
  d,
  isLoading,
}: {
  d: DashboardStats | undefined;
  isLoading: boolean;
  updatedAt?: Date | null;
}) {
  const s = d;
  const pieData = (s?.revenueByProgram ?? []).map((x, i) => ({
    name: x.program,
    value: x.value,
    fill: PIE_COLORS[i % PIE_COLORS.length],
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          title="Doanh thu tháng này (cash)"
          value={isLoading ? '—' : `${fmt.currencyShort(s?.cashThisMonth ?? s?.revenueThisMonth ?? 0)} ₫`}
          icon={<CircleDollarSign strokeWidth={1.5} />}
          accent="brand"
          iconBg="bg-brand-500/10"
          iconColor="text-brand-500"
          isLoading={isLoading}
        />
        <KpiCard
          title="Học phí chưa thu"
          value={isLoading ? '—' : `${fmt.currencyShort(s?.totalDebt ?? 0)} ₫`}
          icon={<UserRoundX strokeWidth={1.5} />}
          accent="violet"
          iconBg="bg-violet-500/10"
          iconColor="text-violet-500"
          isLoading={isLoading}
          href={RoutePaths.PAYMENT_STATUS}
        />
        <KpiCard
          title="Yêu cầu hoàn phí chờ duyệt"
          value={isLoading ? '—' : (s?.pendingRefunds ?? '—')}
          icon={<ReceiptText strokeWidth={1.5} />}
          accent="emerald"
          iconBg="bg-emerald-500/10"
          iconColor="text-emerald-500"
          isLoading={isLoading}
          href={RoutePaths.REFUND_REQUESTS}
        />
        <KpiCard
          title="GV chưa chốt lương"
          value={isLoading ? '—' : (s?.teachersPendingPayroll?.length ?? 0)}
          icon={<Banknote strokeWidth={1.5} />}
          accent="amber"
          iconBg="bg-amber-500/10"
          iconColor="text-amber-500"
          isLoading={isLoading}
          href={RoutePaths.PAYROLL}
        />
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--bg-base)]">
        <h2 className="mb-4 font-display text-lg font-semibold text-slate-900 dark:text-[var(--text-primary)]">
          Doanh thu 6 tháng gần nhất
        </h2>
        {s?.revenueChart?.length ? <RevenueChart data={s.revenueChart} /> : (
          <p className="py-12 text-center text-sm text-slate-500">Chưa có dữ liệu</p>
        )}
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-blue-50 to-white p-6 dark:border-[var(--border-subtle)] dark:from-blue-950/30 dark:to-[var(--bg-base)]">
            <p className="text-sm font-medium text-slate-600 dark:text-[var(--text-secondary)]">Thực thu (cash)</p>
            <p className="mt-2 font-display text-2xl font-bold text-blue-700 dark:text-blue-400">
              {isLoading ? '—' : `${fmt.currencyShort(s?.cashThisMonth ?? 0)} ₫`}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-violet-50 to-white p-6 dark:border-[var(--border-subtle)] dark:from-violet-950/30 dark:to-[var(--bg-base)]">
            <p className="text-sm font-medium text-slate-600 dark:text-[var(--text-secondary)]">Học phí phát sinh</p>
            <p className="mt-2 font-display text-2xl font-bold text-violet-700 dark:text-violet-400">
              {isLoading ? '—' : `${fmt.currencyShort(s?.accrualThisMonth ?? 0)} ₫`}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-[var(--border-subtle)] dark:bg-[var(--bg-base)]">
          <h3 className="mb-2 font-medium text-slate-900 dark:text-[var(--text-primary)]">
            Doanh thu theo chương trình (tháng)
          </h3>
          <div className="h-[200px]">
            {pieData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={2}
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => `${fmt.currencyShort(Number(v ?? 0))} ₫`}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-8 text-center text-sm text-slate-500">Chưa có dữ liệu</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--bg-base)]">
          <h3 className="mb-4 font-display font-semibold text-slate-900 dark:text-[var(--text-primary)]">
            Top 5 học viên còn học phí chưa thu nhiều nhất
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-600 dark:border-[var(--border-subtle)]">
                  <th className="pb-2 pr-2">Học viên</th>
                  <th className="pb-2 pr-2">Lớp</th>
                  <th className="pb-2 pr-2 text-right">Còn lại</th>
                  <th className="pb-2">SĐT PH</th>
                  <th className="pb-2 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {(s?.topDebtors ?? []).map((r) => (
                  <tr key={r.studentName + r.classCode} className="border-b border-slate-100 dark:border-[var(--border-subtle)]">
                    <td className="py-2 pr-2 font-medium text-slate-800 dark:text-[var(--text-primary)]">
                      {r.studentName}
                    </td>
                    <td className="py-2 pr-2 text-slate-600">{r.classCode}</td>
                    <td className="py-2 pr-2 text-right font-semibold text-red-600">
                      {fmt.currencyShort(r.debt)} ₫
                    </td>
                    <td className="py-2 text-slate-500">{r.parentPhone ?? '—'}</td>
                    <td className="py-2 text-right">
                      <Link
                        to={`${RoutePaths.RECEIPT_NEW}?studentId=${encodeURIComponent(r.studentId)}&enrollmentId=${encodeURIComponent(r.enrollmentId)}`}
                        className="text-xs font-medium text-blue-600 hover:underline"
                      >
                        Tạo phiếu thu nhanh
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!isLoading && !(s?.topDebtors?.length) ? (
              <p className="py-6 text-center text-sm text-slate-500">Không có học phí còn lại</p>
            ) : null}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--bg-base)]">
          <h3 className="mb-4 font-display font-semibold text-slate-900 dark:text-[var(--text-primary)]">
            GV chưa chốt lương tháng {dayjs().format('M/YYYY')}
          </h3>
          <ul className="space-y-2">
            {(s?.teachersPendingPayroll ?? []).map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 dark:border-[var(--border-subtle)]"
              >
                <span className="font-medium text-slate-800 dark:text-[var(--text-primary)]">{t.fullName}</span>
                <Link
                  to={`${RoutePaths.PAYROLL}?teacher=${t.id}`}
                  className="text-xs font-medium text-blue-600 hover:underline"
                >
                  Chốt lương
                </Link>
              </li>
            ))}
          </ul>
          {!isLoading && !(s?.teachersPendingPayroll?.length) ? (
            <p className="py-6 text-center text-sm text-slate-500">Tất cả GV đã chốt hoặc chưa có buổi</p>
          ) : null}
        </section>
      </div>

    </div>
  );
}
