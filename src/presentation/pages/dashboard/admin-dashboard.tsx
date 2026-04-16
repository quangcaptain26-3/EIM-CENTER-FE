import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  BookOpen,
  Calendar,
  CalendarOff,
  CreditCard,
  GraduationCap,
  PauseCircle,
  RefreshCcw,
  UserCheck,
} from 'lucide-react';
import { RoutePaths } from '@/app/router/route-paths';
import { fmt } from '@/shared/lib/fmt';
import { cn } from '@/shared/lib/cn';
import type { DashboardStats } from '@/shared/types/dashboard-stats.type';
import { KpiCard } from '@/presentation/pages/dashboard/components/kpi-card';
import { RevenueChart } from '@/presentation/pages/dashboard/components/revenue-chart';
import { ProgramBarChart } from '@/presentation/pages/dashboard/components/program-bar-chart';

dayjs.extend(relativeTime);
dayjs.locale('vi');

function activityDot(action: string): string {
  const d = action.split(':')[0]?.toUpperCase() ?? '';
  if (d === 'AUTH') return 'bg-slate-400';
  if (d === 'FINANCE') return 'bg-emerald-500';
  if (d === 'CLASS') return 'bg-violet-500';
  if (d.includes('ENROLL')) return 'bg-blue-500';
  return 'bg-blue-500';
}

export function AdminDashboardView({
  d,
  isLoading,
}: {
  d: DashboardStats | undefined;
  isLoading: boolean;
  updatedAt?: Date | null;
}) {
  const s = d;
  const enrollTrend = s?.enrollmentActivationMomPercent;
  const revTrend = s?.revenueMomPercent;

  const pendingTotal =
    (s?.pendingPauseRequests ?? 0) +
    (s?.pendingRefunds ?? 0) +
    (s?.makeupBlockedCount ?? 0) +
    (s?.studentsWithDebtCount ?? 0) +
    (s?.pendingCoverSessions ?? 0);

  const sessions = (s?.todaySessions ?? []).slice(0, 6);
  const hasMoreSessions = (s?.todaySessions?.length ?? 0) > 6;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          title="Đang học"
          value={isLoading ? '—' : (s?.activeEnrollments ?? '—')}
          subtitle={s != null ? `+${s.trialEnrollments} đang thử` : undefined}
          trend={
            enrollTrend != null
              ? { value: enrollTrend, label: 'Kích hoạt ghi danh so với tháng trước' }
              : undefined
          }
          icon={<GraduationCap strokeWidth={1.5} />}
          accent="brand"
          iconBg="bg-brand-500/10"
          iconColor="text-brand-500"
          isLoading={isLoading}
          style={{ animation: 'eim-slide-up 0.28s ease-out forwards' }}
        />
        <KpiCard
          title="Lớp đang hoạt động"
          value={isLoading ? '—' : (s?.activeClasses ?? '—')}
          subtitle={s != null ? `${s.totalClasses} tổng lớp` : undefined}
          icon={<BookOpen strokeWidth={1.5} />}
          accent="violet"
          iconBg="bg-violet-500/10"
          iconColor="text-violet-500"
          isLoading={isLoading}
          style={{ animation: 'eim-slide-up 0.28s ease-out forwards', animationDelay: '50ms' }}
        />
        <KpiCard
          title="Doanh thu tháng này"
          value={isLoading ? '—' : `${fmt.currencyShort(s?.revenueThisMonth ?? 0)} ₫`}
          subtitle={
            s != null
              ? `Công nợ: ${fmt.currencyShort(s.totalDebt)} ₫`
              : undefined
          }
          trend={
            revTrend != null ? { value: revTrend, label: 'So với tháng trước (thực thu)' } : undefined
          }
          icon={<Banknote strokeWidth={1.5} />}
          accent="emerald"
          iconBg="bg-emerald-500/10"
          iconColor="text-emerald-500"
          isLoading={isLoading}
          alert={
            s != null && s.totalDebt > 0
              ? `Công nợ tồn: ${fmt.currencyShort(s.totalDebt)} ₫`
              : undefined
          }
          alertClassName="text-rose-500 font-medium dark:text-rose-400"
          href={RoutePaths.FINANCE_DASHBOARD}
          style={{ animation: 'eim-slide-up 0.28s ease-out forwards', animationDelay: '100ms' }}
        />
        <KpiCard
          title="Buổi học hôm nay"
          value={isLoading ? '—' : (s?.totalSessions24h ?? '—')}
          subtitle={
            s != null && s.pendingPauseRequests > 0
              ? `Cần xử lý: ${s.pendingPauseRequests} bảo lưu`
              : 'Không có bảo lưu chờ'
          }
          icon={<Calendar strokeWidth={1.5} />}
          accent="amber"
          iconBg="bg-amber-500/10"
          iconColor="text-amber-500"
          isLoading={isLoading}
          href={RoutePaths.MY_SESSIONS}
          style={{ animation: 'eim-slide-up 0.28s ease-out forwards', animationDelay: '150ms' }}
        />
      </div>

      <div
        className={cn(
          'grid grid-cols-1 gap-4 lg:grid-cols-3',
          !isLoading && 'animate-dashboard-fade-in',
        )}
      >
        <section className="card rounded-2xl p-5 lg:col-span-2">
          <h2 className="eim-section-title mb-4 font-display">
            Doanh thu 6 tháng gần nhất
          </h2>
          {s?.revenueChart?.length ? <RevenueChart data={s.revenueChart} /> : (
            <p className="py-12 text-center text-sm text-slate-500">Chưa có dữ liệu biểu đồ</p>
          )}
        </section>

        <section className="card rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="eim-section-title font-display">
              Lịch hôm nay
            </h2>
            <span className="text-xs text-slate-500">{dayjs().format('DD/MM/YYYY')}</span>
          </div>
          {!s?.todaySessions?.length ? (
            <div className="flex flex-col items-center gap-2 py-10 text-slate-500">
              <CalendarOff className="size-10 opacity-50" strokeWidth={1.5} />
              <p className="text-sm">Không có buổi học hôm nay</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {sessions.map((sess) => (
                <li
                  key={sess.id}
                  className={cn(
                    'flex gap-2 rounded-lg border border-[var(--border-subtle)] p-2 text-sm',
                    sess.highlight &&
                      'border-l-4 border-l-green-500 bg-emerald-50/90 dark:border-l-green-500 dark:bg-emerald-950/30',
                  )}
                >
                  <span
                    className={cn(
                      'shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase',
                      sess.shift === 1 ? 'bg-blue-100 text-blue-700' : 'bg-violet-100 text-violet-700',
                    )}
                  >
                    {sess.shiftLabel}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-[var(--text-primary)]">{sess.classCode}</p>
                      {sess.highlight ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-green-800 dark:border-green-800 dark:bg-emerald-950/60 dark:text-green-300">
                          <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500 ring-2 ring-green-300 dark:ring-green-600" />
                          </span>
                          Đang diễn ra
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-slate-500">{sess.teacherName}</p>
                  </div>
                  <div className="shrink-0 text-right text-xs text-slate-500">
                    <p>{sess.roomName}</p>
                    <p className="font-medium text-[var(--text-secondary)]">{sess.statusLabel}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {hasMoreSessions ? (
            <Link
              to={RoutePaths.MY_SESSIONS}
              className="mt-3 block text-center text-sm font-medium text-blue-600 hover:underline"
            >
              Xem thêm
            </Link>
          ) : null}
        </section>
      </div>

      <div
        className={cn(
          'grid grid-cols-1 gap-4 lg:grid-cols-3',
          !isLoading && 'animate-dashboard-fade-in-delayed',
        )}
      >
        <section className="card rounded-2xl p-5">
          <h2 className="eim-section-title mb-4 font-display">
            Học viên theo cấp độ
          </h2>
          {s?.enrollmentsByProgram?.length ? (
            <ProgramBarChart data={s.enrollmentsByProgram} />
          ) : (
            <p className="py-8 text-center text-sm text-slate-500">Chưa có dữ liệu</p>
          )}
        </section>

        <section className="card rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="eim-section-title font-display">
              Cần xử lý
            </h2>
            <span
              className={cn(
                'rounded-full px-1.5 py-0.5 text-xs font-bold tabular-nums',
                pendingTotal > 0
                  ? 'animate-pulse bg-red-500 text-white'
                  : 'bg-slate-100 text-slate-600',
              )}
            >
              {pendingTotal}
            </span>
          </div>
          {pendingTotal === 0 && !isLoading ? (
            <p className="py-8 text-center text-sm text-slate-500">Không có việc cần xử lý 🎉</p>
          ) : (
            <ul className="space-y-1">
              <PendingRow
                icon={<PauseCircle className="size-4 text-amber-600" />}
                iconBg="bg-amber-50"
                label="Bảo lưu chờ duyệt"
                count={s?.pendingPauseRequests ?? 0}
                to={RoutePaths.PAUSE_REQUESTS}
                forceShow={pendingTotal > 0}
              />
              <PendingRow
                icon={<RefreshCcw className="size-4 text-violet-600" />}
                iconBg="bg-violet-50"
                label="Hoàn phí chờ duyệt"
                count={s?.pendingRefunds ?? 0}
                to={RoutePaths.REFUND_REQUESTS}
                forceShow={pendingTotal > 0}
              />
              <PendingRow
                icon={<AlertTriangle className="size-4 text-red-600" />}
                iconBg="bg-red-50"
                label="Học viên bị khóa học bù"
                count={s?.makeupBlockedCount ?? 0}
                to={RoutePaths.STUDENTS}
                forceShow={pendingTotal > 0}
              />
              <PendingRow
                icon={<CreditCard className="size-4 text-rose-600" />}
                iconBg="bg-rose-50"
                label="Học viên còn nợ"
                count={s?.studentsWithDebtCount ?? 0}
                to={RoutePaths.PAYMENT_STATUS}
                forceShow={pendingTotal > 0}
              />
              <PendingRow
                icon={<UserCheck className="size-4 text-blue-600" />}
                iconBg="bg-blue-50"
                label="Buổi cần cover"
                count={s?.pendingCoverSessions ?? 0}
                to={RoutePaths.CLASSES}
                forceShow={pendingTotal > 0}
              />
            </ul>
          )}
        </section>

        <section
          className={cn('card rounded-2xl p-5', !isLoading && 'animate-dashboard-activities-in')}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="eim-section-title font-display">
              Hoạt động gần đây
            </h2>
            <Link
              to={RoutePaths.AUDIT_LOGS}
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              Xem tất cả
            </Link>
          </div>
          {!s?.recentActivities?.length ? (
            <p className="py-8 text-center text-sm text-slate-500">Chưa có hoạt động</p>
          ) : (
            <ul className="space-y-3">
              {s.recentActivities.slice(0, 8).map((a, i) => (
                <li key={`${a.eventTime}-${i}`} className="flex gap-3 text-sm">
                  <span
                    className={cn('mt-1.5 size-2 shrink-0 rounded-full', activityDot(a.action))}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[var(--text-primary)]">{a.description}</p>
                    <p className="text-xs text-slate-500">
                      {a.actorName ? `${a.actorName} · ` : ''}
                      {dayjs(a.eventTime).fromNow()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

    </div>
  );
}

function PendingRow({
  icon,
  iconBg,
  label,
  count,
  to,
  forceShow,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  count: number;
  to: string;
  forceShow?: boolean;
}) {
  if (!forceShow && count <= 0) return null;
  return (
    <li>
      <Link
        to={to}
        className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-[var(--bg-subtle)]"
      >
        <span className={cn('flex size-9 items-center justify-center rounded-full', iconBg)}>
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
          <p className="text-xs text-slate-500">{count} yêu cầu</p>
        </div>
        <ArrowRight className="size-4 shrink-0 text-slate-400" />
      </Link>
    </li>
  );
}
