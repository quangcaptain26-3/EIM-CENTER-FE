/**
 * use-users.ts
 * Hook quản lý danh sách và thông tin chi tiết người dùng (nhân viên).
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/infrastructure/query/query-keys';
import { systemApi } from '@/infrastructure/services/system.api';
import type { ListUsersParams } from '@/application/system/dto/system.dto';

/**
 * Hook lấy danh sách tài khoản người dùng trong hệ thống.
 * @param params Search query, filtered by role hoặc status.
 */
export function useUsers(params: ListUsersParams) {
  return useQuery({
    queryKey: queryKeys.system.users(params),
    queryFn: async () => {
      const response = await systemApi.listUsers(params);
      return response.data;
    },
  });
}

/**
 * Hook lấy thông tin chi tiết của một người dùng.
 * @param id UUID của người dùng trong bảng auth_users
 */
export function useUser(id: string) {
  return useQuery({
    queryKey: queryKeys.system.userDetail(id),
    queryFn: async () => {
      const response = await systemApi.getUser(id);
      return response.data;
    },
    enabled: !!id, // Chỉ fetch khi có ID
  });
}
