// get-me.use-case.ts
// Use-case lấy thông tin người dùng đang đăng nhập từ server.

import { authApi } from '@/infrastructure/services/auth.api';
import { mapAuthUserDto } from '@/application/auth/mappers/auth.mapper';

/**
 * Use-case lấy thông tin user hiện tại:
 * 1. Gọi GET /auth/me (interceptor tự gắn Bearer token)
 * 2. Map raw response thành AuthUserModel đã có kiểu đầy đủ
 * 3. Return để caller (React Query / store) lưu vào state
 */
export async function getMeUseCase() {
  const response = await authApi.getMe();
  return mapAuthUserDto(response.data.data);
}
