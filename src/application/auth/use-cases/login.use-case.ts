// login.use-case.ts
// Use-case xử lý luồng đăng nhập.
// Gọi API → lấy raw data → map sang typed DTO → return.

import { authApi } from '@/infrastructure/services/auth.api';
import { mapLoginResponseDto } from '@/application/auth/mappers/auth.mapper';
import type { LoginRequestDto } from '@/application/auth/dto/login.dto';

/**
 * Use-case đăng nhập:
 * 1. Gọi POST /auth/login với email + password
 * 2. Map response thành LoginResponseDto (accessToken, refreshToken, user)
 * 3. Return kết quả để caller (store/hook) lưu trữ
 */
export async function loginUseCase(payload: LoginRequestDto) {
  const response = await authApi.login(payload);
  // response.data là ApiSuccessResponse<RawLoginData>
  // .data bên trong là object raw chưa qua kiểm tra kiểu
  return mapLoginResponseDto(response.data.data);
}
