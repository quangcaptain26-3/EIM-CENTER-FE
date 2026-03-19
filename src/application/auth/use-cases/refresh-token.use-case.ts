// refresh-token.use-case.ts
// Use-case làm mới access token khi token cũ hết hạn.

import { authApi } from '@/infrastructure/services/auth.api';
import { mapRefreshResponseDto } from '@/application/auth/mappers/auth.mapper';
import type { RefreshTokenRequestDto } from '@/application/auth/dto/refresh-token.dto';

/**
 * Use-case refresh token:
 * 1. Gọi POST /auth/refresh với refreshToken hiện tại
 * 2. Map response thành RefreshTokenResponseDto (accessToken, refreshToken?)
 * 3. Return để caller cập nhật token trong store/storage
 */
export async function refreshTokenUseCase(payload: RefreshTokenRequestDto) {
  const response = await authApi.refreshToken(payload);
  return mapRefreshResponseDto(response.data.data);
}
