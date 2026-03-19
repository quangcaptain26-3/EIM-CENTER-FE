// auth-user.dto.ts
// DTO cho endpoint GET /auth/me và POST /auth/logout.

import type { AuthUserModel } from '@/domain/auth/models/user.model';

/**
 * Dữ liệu trả về từ GET /auth/me.
 * Cấu trúc giống AuthUserModel – alias để rõ ràng hơn ở tầng application.
 */
export type MeResponseDto = AuthUserModel;

/** Dữ liệu gửi lên khi đăng xuất – cần refreshToken để backend thu hồi */
export interface LogoutRequestDto {
  refreshToken: string;
}
