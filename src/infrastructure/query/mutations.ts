// mutations.ts
// File đón lõng chờ định nghĩa các cấu hình mutation wrapper tuỳ biến
// hoặc Global Error Handling cho những lúc submit data thất bại.

import type { UseMutationOptions } from '@tanstack/react-query';
import type { ApiErrorResponse } from '@/shared/types/api.type';

/**
 * Kiểu gốc cho Mutation tự build:
 * TData: Kiểu Model trả về thành công
 * TVariables: Kiểu Input JSON truyền lên
 */
export type AppMutationOptions<TData, TVariables> = UseMutationOptions<
  TData,
  ApiErrorResponse,
  TVariables,
  unknown
>;

// TODO (FE-sau): Gom logic show Toast báo lỗi cho mọi mutation ở đây nếu cần.
