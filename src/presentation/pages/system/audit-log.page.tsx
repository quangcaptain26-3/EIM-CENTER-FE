/**
 * audit-log.page.tsx
 * Trang xem lịch sử hoạt động hệ thống (dành cho ROOT và DIRECTOR).
 */

import { useState } from 'react';
import { PageShell } from '@/presentation/components/common/page-shell';
import { AuditLogTable } from '@/presentation/components/system/audit-log-table';
import { useAuditLogs } from '@/presentation/hooks/system/use-audit-logs';
import { useAuth } from '@/presentation/hooks/auth/use-auth';
import { AppRoles } from '@/shared/constants/roles';
import { AlertCircle } from 'lucide-react';

const LIMIT = 20;

export const AuditLogPage = () => {
  const { hasAnyRole, initialized } = useAuth();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    entityType: '',
    action: '',
    fromDate: '',
    toDate: '',
  });

  // Guard: Chỉ Root và Director mới có quyền xem
  const isAuthorized = hasAnyRole([AppRoles.ROOT, AppRoles.DIRECTOR]);

  // Hook lấy data
  const { data, isLoading } = useAuditLogs({
    ...filters,
    limit: LIMIT,
    offset: (page - 1) * LIMIT,
  });

  if (!initialized) return null;

  // Nếu không có quyền, điều hướng về home hoặc thông báo lỗi
  if (!isAuthorized) {
    return (
      <PageShell title="Truy cập bị từ chối">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="rounded-full bg-rose-50 p-6 mb-6 text-rose-500">
            <AlertCircle className="h-16 w-16" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Bạn không có quyền truy cập</h2>
          <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
            Khu vực này chỉ dành cho cấp quản lý cao nhất. Vui lòng liên hệ quản trị viên nếu bạn tin rằng đây là một sự nhầm lẫn.
          </p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell 
      title="Nhật ký hoạt động" 
      description="Theo dõi mọi hành động thay đổi dữ liệu trong hệ thống để phục vụ kiểm soát và đối soát."
    >
      <AuditLogTable 
        logs={data?.items || []}
        loading={isLoading}
        pagination={{
            page,
            limit: LIMIT,
            total: (data as any)?.total || 0,
            onPageChange: (p) => setPage(p)
        }}
        filters={filters}
        onFilterChange={(f) => {
            setFilters(f);
            setPage(1); // Reset page khi lọc
        }}
      />
    </PageShell>
  );
};

export default AuditLogPage;
