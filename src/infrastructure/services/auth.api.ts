// auth.api.ts
// Lớp gọi HTTP cho module Auth – bám sát các endpoint BE đã định nghĩa.
// Không chứa business logic – chỉ gửi request và trả về envelope từ BE.

import { apiClient } from '@/app/config/axios';
import type { ApiSuccessResponse } from '@/shared/types/api.type';
import type { LoginRequestDto } from '@/application/auth/dto/login.dto';
import type { RefreshTokenRequestDto } from '@/application/auth/dto/refresh-token.dto';
import type { LogoutRequestDto } from '@/application/auth/dto/auth-user.dto';

// ----------------------------------------------------------------
// Kiểu dữ liệu raw trả về từ các endpoint (chưa qua mapper)
// ----------------------------------------------------------------

/** Raw data từ POST /auth/login – chứa cả token lẫn thông tin user */
interface RawLoginData {
  accessToken: string;
  refreshToken: string;
  user: unknown;
}

/** Raw data từ POST /auth/refresh */
interface RawRefreshData {
  accessToken: string;
  refreshToken?: string;
}

/** Raw data từ GET /auth/me */
type RawMeData = unknown;

// ----------------------------------------------------------------
// Auth API object
// ----------------------------------------------------------------

/** Tập hợp các hàm gọi API liên quan đến xác thực */
export const authApi = {
  /**
   * Đăng nhập – POST /auth/login
   * @param payload email + password
   */
  login(payload: LoginRequestDto) {
    return apiClient.post<ApiSuccessResponse<RawLoginData>>(
      '/auth/login',
      payload
    );
  },

  /**
   * Làm mới access token – POST /auth/refresh
   * @param payload refreshToken hiện tại
   */
  refreshToken(payload: RefreshTokenRequestDto) {
    return apiClient.post<ApiSuccessResponse<RawRefreshData>>(
      '/auth/refresh',
      payload
    );
  },

  /**
   * Đăng xuất – POST /auth/logout
   * Backend thu hồi refreshToken để ngăn dùng lại.
   * @param payload refreshToken cần huỷ
   */
  logout(payload: LogoutRequestDto) {
    return apiClient.post<ApiSuccessResponse<null>>(
      '/auth/logout',
      payload
    );
  },

  /**
   * Lấy thông tin user hiện tại – GET /auth/me
   * Yêu cầu Authorization header (được gắn tự động bởi interceptor).
   */
  getMe() {
    return apiClient.get<ApiSuccessResponse<RawMeData>>('/auth/me');
  },
};
