// auth.type.ts
// Định nghĩa các kiểu dữ liệu dùng trong shared layer liên quan đến xác thực.
// Đồng bộ với AuthUserModel ở domain để tránh định nghĩa trùng lắp.

import type { AuthUserModel } from '@/domain/auth/models/user.model';
import type { AppRole } from '@/shared/constants/roles';

/**
 * Thông tin user trong Redux/Zustand store.
 * Kế thừa AuthUserModel và thêm meta thời gian đăng nhập.
 * roles gắn chặt với AppRole để TypeScript có thể kiểm tra exhaustiveness.
 */
export interface AuthStateUser extends Omit<AuthUserModel, 'roles'> {
  /** Danh sách roles – dùng AppRole để đảm bảo type safety */
  roles: AppRole[];

  /** Thời điểm đăng nhập (Unix ms) – dùng để hiển thị hoặc kiểm tra session */
  loggedInAt?: number;
}

/** Token pair được lưu trong bộ nhớ (memory hoặc storage) */
export interface AuthTokens {
  /** JWT access token – null nếu chưa đăng nhập */
  accessToken: string | null;

  /** Refresh token – null nếu chưa đăng nhập hoặc không có */
  refreshToken: string | null;
}

// Payload giải mã từ JWT access token (dùng khi cần đọc thông tin local)
export interface JwtUserPayload {
  sub: string;        // User ID
  email: string;
  roles: AppRole[];
  iat: number;        // Issued at (Unix seconds)
  exp: number;        // Expiry (Unix seconds)
}
