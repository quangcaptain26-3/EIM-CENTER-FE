import { useQuery } from '@tanstack/react-query';
import { getAuditLogs } from '@/infrastructure/services/system.api';
import { QUERY_KEYS } from '@/infrastructure/query/query-keys';
import { parseAuditLogListResponse } from '@/infrastructure/services/audit-log-parse.util';

export interface AuditLogsParams {
  page: number;
  limit: number;
  actor?: string;
  action?: string;
  entityType?: string;
  dateFrom?: string;
  dateTo?: string;
}

const STALE_AUDIT_MS = 30_000;

export function useAuditLogs(params: AuditLogsParams) {
  const apiParams: Record<string, unknown> = {
    page: params.page,
    limit: params.limit,
  };
  if (params.actor?.trim()) apiParams.actor = params.actor.trim();
  if (params.action?.trim()) apiParams.action = params.action.trim();
  if (params.entityType?.trim()) apiParams.entityType = params.entityType.trim();
  if (params.dateFrom) apiParams.dateFrom = params.dateFrom;
  if (params.dateTo) apiParams.dateTo = params.dateTo;

  const q = useQuery({
    queryKey: QUERY_KEYS.AUDIT.list(apiParams),
    queryFn: () => getAuditLogs(apiParams),
    staleTime: STALE_AUDIT_MS,
  });

  const parsed = q.data ? parseAuditLogListResponse(q.data) : { items: [], total: 0, page: 1, limit: 20 };

  return {
    rows: parsed.items,
    total: parsed.total,
    page: parsed.page,
    limit: parsed.limit,
    isLoading: q.isLoading,
    error: q.error,
    refetch: q.refetch,
  };
}

/** @deprecated dùng useAuditLogs */
export const useAuditLogsList = useAuditLogs;
