import { Link } from 'react-router-dom';
import { Calendar, ClipboardCheck, School, Wallet } from 'lucide-react';
import { RoutePaths } from '@/app/router/route-paths';
import { fmt } from '@/shared/lib/fmt';
import { cn } from '@/shared/lib/cn';
import type { DashboardStats } from '@/shared/types/dashboard-stats.type';
import { KpiCard } from '@/presentation/pages/dashboard/components/kpi-card';
import { useNotificationsDropdown } from '@/presentation/hooks/use-notifications';

export function TeacherDashboardView({
  d,
  isLoading,
}: {
  d: DashboardStats | undefined;
  isLoading: boolean;
}) {
  const t = d?.teacher;
  const { items: notifications, isLoading: notifLoading } = useNotificationsDropdown(true);
  const top5 = notifications.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <KpiCard
          title="Buổi đã dạy (tháng này)"
          value={isLoading ? '—' : (t?.sessionsDoneThisMonth ?? '—')}
          icon={<ClipboardCheck strokeWidth={1.5} />}
          accent="brand"
          iconBg="bg-brand-500/10"
          iconColor="text-brand-500"
          isLoading={isLoading}
        />
        <KpiCard
          title="Buổi sắp dạy"
          value={isLoading ? '—' : (t?.upcomingSessions ?? '—')}
          icon={<Calendar strokeWidth={1.5} />}
          accent="amber"
          iconBg="bg-amber-500/10"
          iconColor="text-amber-500"
          isLoading={isLoading}
          href={RoutePaths.MY_SESSIONS}
        />
        <KpiCard
          title="Lương ước tính tháng này"
          value={isLoading ? '—' : `${fmt.currencyShort(t?.estimatedSalaryMonth ?? 0)} ₫`}
          subtitle={
            t != null ? `${fmt.currencyShort(t.salaryPerSession)} ₫/buổi` : undefined
          }
          icon={<Wallet strokeWidth={1.5} />}
          accent="emerald"
          iconBg="bg-emerald-500/10"
          iconColor="text-emerald-500"
          isLoading={isLoading}
        />
        <KpiCard
          title="Số lớp đang dạy"
          value={isLoading ? '—' : (t?.activeClasses ?? '—')}
          icon={<School strokeWidth={1.5} />}
          accent="violet"
          iconBg="bg-violet-500/10"
          iconColor="text-violet-500"
          isLoading={isLoading}
          href={RoutePaths.MY_SESSIONS}
        />
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--bg-base)]">
        <h2 className="mb-4 font-display text-lg font-semibold text-slate-900 dark:text-[var(--text-primary)]">
          Lịch dạy 7 ngày tới
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-7">
          {(t?.weekDays ?? []).map((day) => (
            <div
              key={day.date}
              className={cn(
                'min-h-[120px] rounded-lg border p-2 text-xs',
                day.isToday
                  ? 'border-blue-500 bg-blue-50/80 dark:border-blue-600 dark:bg-blue-950/40'
                  : 'border-slate-200 dark:border-[var(--border-subtle)]',
              )}
            >
              <p className="mb-2 font-semibold text-slate-800 dark:text-[var(--text-primary)]">{day.label}</p>
              <ul className="space-y-1">
                {day.sessions.map((sess) => (
                  <li key={sess.id} className="rounded bg-white/80 p-1 dark:bg-[var(--bg-surface)]">
                    <Link
                      to={RoutePaths.SESSION_DETAIL.replace(':sessionId', sess.id)}
                      className="font-medium text-slate-900 underline-offset-2 hover:underline dark:text-[var(--text-primary)]"
                    >
                      {sess.classCode}
                    </Link>
                    <p className="text-[10px] text-slate-500">
                      {sess.shiftLabel} · {sess.roomName}
                    </p>
                    {day.isToday && sess.canAttendance ? (
                      <Link
                        to={RoutePaths.SESSION_DETAIL.replace(':sessionId', sess.id)}
                        className="mt-1 inline-block rounded bg-blue-600 px-2 py-0.5 text-[10px] font-medium text-white hover:bg-blue-700"
                      >
                        Điểm danh
                      </Link>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--bg-base)]">
        <h2 className="mb-4 font-display text-lg font-semibold text-slate-900 dark:text-[var(--text-primary)]">
          Thống kê điểm danh học sinh (tháng này)
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-lg border border-slate-200 p-3 text-sm">
            <p className="text-slate-500">Có mặt</p>
            <p className="mt-1 text-xl font-semibold text-emerald-600">{t?.attendanceSummary?.present ?? 0}</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-3 text-sm">
            <p className="text-slate-500">Đi muộn</p>
            <p className="mt-1 text-xl font-semibold text-amber-500">{t?.attendanceSummary?.late ?? 0}</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-3 text-sm">
            <p className="text-slate-500">Vắng có phép</p>
            <p className="mt-1 text-xl font-semibold text-blue-500">{t?.attendanceSummary?.absentExcused ?? 0}</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-3 text-sm">
            <p className="text-slate-500">Vắng không phép</p>
            <p className="mt-1 text-xl font-semibold text-rose-500">{t?.attendanceSummary?.absentUnexcused ?? 0}</p>
          </div>
        </div>
        {!notifLoading && top5.length > 0 ? (
          <p className="mt-4 text-xs text-slate-500">Thông báo mới: {top5[0]?.message}</p>
        ) : null}
      </section>

    </div>
  );
}
