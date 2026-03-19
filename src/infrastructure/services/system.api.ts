/**
 * system.api.ts
 * Lớp giao tiếp HTTP cho module Hệ thống và Phân quyền (Auth Management).
 */

import { apiClient } from '@/app/config/axios';
import type { ApiSuccessResponse } from '@/shared/types/api.type';
import type {
  ListNotificationsDto,
  ListAuditLogsParams,
  ListUsersParams,
  CreateUserDto,
  UpdateUserDto,
  AssignRoleDto
} from '@/application/system/dto/system.dto';

/**
 * Service gọi API liên quan đến Hệ thống, Thông báo và Quản lý người dùng.
 */
export const systemApi = {
  // --- NOTIFICATIONS ---

  /** Lấy danh sách thông báo của người dùng hiện tại */
  listNotifications(params?: ListNotificationsDto) {
    return apiClient.get<ApiSuccessResponse<any[]>>('/system/notifications', { params });
  },

  /** Đánh dấu một thông báo là đã đọc */
  markNotificationRead(id: string) {
    return apiClient.patch<ApiSuccessResponse<boolean>>(`/system/notifications/${id}/read`);
  },

  /** Đánh dấu tất cả thông báo của mình là đã đọc */
  markAllNotificationsRead() {
    return apiClient.patch<ApiSuccessResponse<boolean>>('/system/notifications/read-all');
  },

  // --- AUDIT LOGS ---

  /** Lấy danh sách nhật ký kiểm toán (yêu cầu quyền quản lý) */
  listAuditLogs(params?: ListAuditLogsParams) {
    return apiClient.get<ApiSuccessResponse<any[]>>('/system/audit-logs', { params });
  },

  // --- USER MANAGEMENT ---

  /** Lấy danh sách người dùng trong hệ thống (search & filter) */
  listUsers(params?: ListUsersParams) {
    return apiClient.get<ApiSuccessResponse<any[]>>('/system/users', { params });
  },

  /** Lấy thông tin chi tiết của một người dùng theo ID */
  getUser(id: string) {
    return apiClient.get<ApiSuccessResponse<any>>(`/system/users/${id}`);
  },

  /** Tạo tài khoản nhân viên mới */
  createUser(dto: CreateUserDto) {
    return apiClient.post<ApiSuccessResponse<any>>('/system/users', dto);
  },

  /** Cập nhật thông tin cơ bản của người dùng */
  updateUser(id: string, dto: UpdateUserDto) {
    return apiClient.patch<ApiSuccessResponse<any>>(`/system/users/${id}`, dto);
  },

  /** Gán một vai trò (role) cho người dùng */
  assignRole(dto: AssignRoleDto) {
    return apiClient.post<ApiSuccessResponse<boolean>>('/system/users/assign-role', dto);
  },

  /** Thu hồi một vai trò khỏi người dùng */
  revokeRole(userId: string, roleCode: string) {
    return apiClient.delete<ApiSuccessResponse<boolean>>('/system/users/revoke-role', {
      data: { userId, roleCode }
    });
  },
};
