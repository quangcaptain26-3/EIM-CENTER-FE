/**
 * React Query hooks để truy vấn dữ liệu Trial Leads
 * Bao gồm: danh sách có filter và chi tiết theo ID
 * Sử dụng TanStack Query (useQuery) + trialsApi service
 */

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { queryKeys } from '@/infrastructure/query/query-keys';
import { trialsApi } from '@/infrastructure/services/trials.api';
import type { TrialListParams } from '@/application/trials/dto/trials.dto';

/**
 * Hook lấy danh sách Trial Leads với filter và phân trang
 * Giữ nguyên data cũ khi đang fetch để tránh flicker khi chuyển trang / filter
 *
 * @param params - Tham số filter: status, search, limit, offset (tất cả tùy chọn)
 * @returns UseQueryResult chứa { items, meta: { total, limit, offset } }
 *
 * @example
 * const { data, isLoading } = useTrials({ status: 'NEW', search: '0912' });
 */
export const useTrials = (params?: TrialListParams) => {
  return useQuery({
    // Key lồng theo params để cache riêng biệt cho từng bộ filter
    queryKey: queryKeys.trials.filtered(params as Record<string, unknown>),
    queryFn: () => trialsApi.listTrials(params),
    // Giữ data trang/filter trước khi có kết quả mới — tránh nhảy layout
    placeholderData: keepPreviousData,
  });
};

/**
 * Hook lấy chi tiết một Trial Lead theo ID
 * Chỉ fetch khi ID hợp lệ (không fetch với undefined/null/empty)
 * Kết quả bao gồm thông tin schedule nếu đã đặt lịch
 *
 * @param id - UUID của trial lead cần xem chi tiết
 * @returns UseQueryResult chứa TrialLeadModel (với schedule nếu có)
 *
 * @example
 * const { data: trial, isLoading } = useTrial(id);
 */
export const useTrial = (id?: string) => {
  return useQuery({
    queryKey: queryKeys.trials.detail(id!),
    queryFn: () => trialsApi.getTrial(id!),
    // Không gọi API nếu chưa có ID (tránh lỗi 400/404 vô nghĩa)
    enabled: !!id,
  });
};
