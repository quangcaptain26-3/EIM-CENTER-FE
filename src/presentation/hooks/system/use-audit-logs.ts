/**
 * use-audit-logs.ts
 * Hook truy vấn danh sách nhật ký kiểm toán hệ thống.
 */

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { queryKeys } from '@/infrastructure/query/query-keys';
import { systemApi } from '@/infrastructure/services/system.api';
import { mapToAuditLogModel } from '@/application/system/mappers/system.mapper';
import type { ListAuditLogsParams } from '@/application/system/dto/system.dto';

/**
 * Hook lấy danh sách nhật ký kiểm toán với bộ lọc và phân trang.
 * @param params Bộ lọc: entityType, action, actorId, dateRange...
 */
export function useAuditLogs(params: ListAuditLogsParams) {
  return useQuery({
    queryKey: queryKeys.system.auditLogs(params),
    queryFn: async () => {
      const response = await systemApi.listAuditLogs(params);
      // Ánh xạ dữ liệu thô sang model domain
      return {
        ...response.data,
        items: (response.data as any).items.map(mapToAuditLogModel),
      };
    },
    // Giữ lại dữ liệu trang cũ trong khi tải trang mới để tránh flicker UI (Pagination)
    placeholderData: keepPreviousData,
    staleTime: 60000, // Audit logs thường ít thay đổi liên tục, có thể để cache lâu hơn
  });
}
