/**
 * system.dto.ts
 * Các Data Transfer Objects (DTO) dùng để giao tiếp với Backend API.
 */

/** Tham số khi lấy danh sách thông báo */
export interface ListNotificationsDto {
  isRead?: string;      // "true", "false" hoặc undefined
  limit?: number;       // Số bản ghi mỗi trang
  offset?: number;      // Bỏ qua bao nhiêu bản ghi
}

/** Tham số khi đánh dấu thông báo đã đọc */
export interface MarkReadDto {
  notificationId: string;
}

/** Tham số tìm kiếm/lọc nhật ký kiểm toán */
export interface ListAuditLogsParams {
  entityType?: string;      // Lọc theo loại entity (e.g., STUDENT, CLASS)
  action?: string;          // Lọc theo hành động (e.g., CREATE, UPDATE)
  actorId?: string;         // Lọc theo người thực hiện (UUID)
  fromDate?: string;        // Lọc từ ngày (ISO string)
  toDate?: string;          // Lọc đến ngày (ISO string)
  offset?: number;          // Phân trang
  limit?: number;
}

/** Tham số tìm kiếm tài khoản người dùng */
export interface ListUsersParams {
  search?: string;   // Theo email hoặc tên
  roleCode?: string; // Lọc theo chức vụ
  status?: string;   // ACTIVE / INACTIVE
  offset?: number;
  limit?: number;
}

/** DTO tạo mới người dùng */
export interface CreateUserDto {
  email: string;
  fullName: string;
  password?: string;
  roleCode: string;
}

/** DTO cập nhật thông tin người dùng */
export interface UpdateUserDto {
  fullName?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

/** DTO gán vai trò cho người dùng */
export interface AssignRoleDto {
  userId: string;
  roleCode: string;
}
