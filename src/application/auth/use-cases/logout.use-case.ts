// logout.use-case.ts
// Use-case đăng xuất – gọi BE để thu hồi refreshToken.

import { authApi } from '@/infrastructure/services/auth.api';
import type { LogoutRequestDto } from '@/application/auth/dto/auth-user.dto';

/**
 * Use-case đăng xuất:
 * 1. Gọi POST /auth/logout kèm refreshToken
 * 2. BE thu hồi token – ngăn người dùng dùng lại refreshToken cũ
 * 3. Không cần trả về gì – caller tự xoá token khỏi storage/store sau đó
 */
export async function logoutUseCase(payload: LogoutRequestDto): Promise<void> {
  await authApi.logout(payload);
}
