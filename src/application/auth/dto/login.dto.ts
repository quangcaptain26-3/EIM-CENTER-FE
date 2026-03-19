// login.dto.ts
// DTO (Data Transfer Object) cho chức năng đăng nhập.
// Mô tả hình dạng dữ liệu gửi lên và nhận về từ API /auth/login.

import type { AuthUserModel } from '@/domain/auth/models/user.model';

/** Dữ liệu gửi lên khi đăng nhập */
export interface LoginRequestDto {
  email: string;
  password: string;
}

/**
 * Dữ liệu trả về sau khi đăng nhập thành công.
 * Tương ứng với data bên trong: POST /auth/login → { success, data }
 */
export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  user: AuthUserModel;
}
