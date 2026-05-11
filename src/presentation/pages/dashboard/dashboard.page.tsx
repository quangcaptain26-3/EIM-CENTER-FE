import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { RefreshCw } from 'lucide-react';
import { useAppSelector } from '@/app/store/hooks';
import { ROLES } from '@/shared/constants/roles';
import { cn } from '@/shared/lib/cn';
import { useDashboardStats } from '@/presentation/hooks/use-dashboard-stats';
import { PageHeader } from '@/shared/ui/page-header';
import { Button } from '@/shared/ui/button';
import { AdminDashboardView } from '@/presentation/pages/dashboard/admin-dashboard';
import { AccountantDashboardView } from '@/presentation/pages/dashboard/accountant-dashboard';
import { TeacherDashboardView } from '@/presentation/pages/dashboard/teacher-dashboard';

export default function DashboardPage() {
  const role = useAppSelector((s) => s.auth.user?.role);
  const { data, isLoading, isFetching, dataUpdatedAt, refetch, isError } = useDashboardStats();
  const [spin, setSpin] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    if (dataUpdatedAt) setUpdatedAt(new Date(dataUpdatedAt));
  }, [dataUpdatedAt]);

  const onRefresh = async () => {
    setSpin(true);
    try {
      await refetch();
    } finally {
      window.setTimeout(() => setSpin(false), 1000);
    }
  };

  const subtitle =
    role === ROLES.ACCOUNTANT
      ? 'Tài chính & học phí'
      : role === ROLES.TEACHER
        ? 'Lịch dạy & lương'
        : role === ROLES.ACADEMIC
          ? 'Lớp học, học viên & lịch dạy (theo vai trò Học vụ)'
          : 'Số liệu vận hành trung tâm';

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader title="Tổng quan" subtitle={subtitle} />
        <div className="flex flex-wrap items-center gap-3 sm:ml-auto">
          {updatedAt ? (
            <span className="text-xs text-slate-500">
              Cập nhật lúc {dayjs(updatedAt).format('HH:mm')}
            </span>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => void onRefresh()}
            disabled={isFetching}
          >
            <RefreshCw className={cn('size-4', (spin || isFetching) && 'animate-spin')} />
            Làm mới
          </Button>
        </div>
      </div>

      {isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          Không tải được dữ liệu dashboard. Kiểm tra kết nối hoặc quyền truy cập.
        </div>
      ) : null}

      {!isLoading && (data?.warnings?.length ?? 0) > 0 ? (
        <div className="mb-6 space-y-3">
          {data!.warnings!.map((w) => (
            <div
              key={w.code}
              className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/95"
            >
              <p className="font-semibold text-amber-200">{w.title}</p>
              <p className="mt-1 text-amber-100/90">{w.message}</p>
            </div>
          ))}
        </div>
      ) : null}

      {role === ROLES.ACCOUNTANT ? (
        <AccountantDashboardView d={data} isLoading={isLoading} />
      ) : role === ROLES.TEACHER ? (
        <TeacherDashboardView d={data} isLoading={isLoading} />
      ) : (
        <AdminDashboardView d={data} isLoading={isLoading} viewerRole={role} />
      )}
    </div>
  );
}
