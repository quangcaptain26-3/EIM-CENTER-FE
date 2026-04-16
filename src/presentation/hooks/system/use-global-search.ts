import { useQuery } from '@tanstack/react-query';
import { globalSearch } from '@/infrastructure/services/system.api';
import { parseGlobalSearchResponse } from '@/infrastructure/services/global-search-parse.util';
import { QUERY_KEYS } from '@/infrastructure/query/query-keys';

/**
 * @param q chuỗi tìm kiếm
 * @param enabled mặc định true khi gọi với q đủ dài bên trong
 */
export function useGlobalSearch(q: string, enabled = true) {
  const trimmed = q.trim();
  const shouldRun = enabled && trimmed.length >= 2;
  return useQuery({
    queryKey: QUERY_KEYS.SEARCH.global(trimmed),
    queryFn: async () => {
      const res = await globalSearch(trimmed);
      return parseGlobalSearchResponse(res);
    },
    enabled: shouldRun,
    staleTime: 30_000,
  });
}
