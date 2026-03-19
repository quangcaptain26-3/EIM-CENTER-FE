// user.model.ts
// Định nghĩa model domain cho người dùng đã đăng nhập.
// Đây là kiểu dữ liệu "thuần" ở tầng domain – không phụ thuộc vào framework hay API.

/** Thông tin người dùng đã xác thực trong hệ thống */
export interface AuthUserModel {
  /** ID duy nhất của user */
  id: string;

  /** Email đăng nhập */
  email: string;

  /** Họ tên đầy đủ */
  fullName: string;

  /** Danh sách vai trò – dùng để phân quyền truy cập */
  roles: string[];

  /** Danh sách quyền chi tiết (granular permissions – tuỳ backend trả về) */
  permissions?: string[];
}
