/**
 * use-user-mutations.ts
 * Hook quản lý các thao tác mutation liên quan đến tài khoản người dùng và phân quyền.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/infrastructure/query/query-keys';
import { systemApi } from '@/infrastructure/services/system.api';
import type { CreateUserDto, UpdateUserDto, AssignRoleDto } from '@/application/system/dto/system.dto';
import { toastAdapter } from '@/infrastructure/adapters/toast.adapter';

/**
 * Hook tạo tài khoản nhân viên mới.
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateUserDto) => systemApi.createUser(dto),
    onSuccess: () => {
      toastAdapter.success('Đã tạo tài khoản thành công');
      // Invalidate danh sách user để cập nhật UI
      queryClient.invalidateQueries({ queryKey: queryKeys.system.users() });
    },
    onError: () => {
      toastAdapter.error('Không thể tạo tài khoản. Vui lòng kiểm tra lại dữ liệu.');
    },
  });
}

/**
 * Hook cập nhật thông tin người dùng.
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string, dto: UpdateUserDto }) => 
      systemApi.updateUser(id, dto),
    onSuccess: (_, { id }) => {
      toastAdapter.success('Cập nhật thông tin thành công');
      // Invalidate cả chi tiết và danh sách
      queryClient.invalidateQueries({ queryKey: queryKeys.system.userDetail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.system.users() });
    },
    onError: () => {
      toastAdapter.error('Lỗi khi cập nhật thông tay người dùng');
    },
  });
}

/**
 * Hook gán vai trò mới cho người dùng.
 */
export function useAssignRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: AssignRoleDto) => systemApi.assignRole(dto),
    onSuccess: (_, dto) => {
      toastAdapter.success('Đã gán vai trò mới');
      // Cập nhật lại cache chi tiết người dùng
      queryClient.invalidateQueries({ queryKey: queryKeys.system.userDetail(dto.userId) });
    },
    onError: () => {
      toastAdapter.error('Không thể gán vai trò');
    },
  });
}

/**
 * Hook thu hồi vai trò khỏi người dùng.
 */
export function useRevokeRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, roleCode }: { userId: string, roleCode: string }) => 
      systemApi.revokeRole(userId, roleCode),
    onSuccess: (_, { userId }) => {
      toastAdapter.warning('Đã thu hồi vai trò');
      // Cập nhật lại cache chi tiết người dùng
      queryClient.invalidateQueries({ queryKey: queryKeys.system.userDetail(userId) });
    },
    onError: () => {
      toastAdapter.error('Lỗi khi thu hồi vai trò');
    },
  });
}
