// auth.mapper.ts
// Mapper chuyển đổi dữ liệu thô từ API response sang các DTO đã định nghĩa.
// Dùng type assertion có kiểm soát – không dùng any bừa bãi.
// Được gọi ở tầng infrastructure sau khi nhận response từ HTTP client.

import type { AuthUserModel } from '@/domain/auth/models/user.model';
import type { LoginResponseDto } from '@/application/auth/dto/login.dto';
import type { RefreshTokenResponseDto } from '@/application/auth/dto/refresh-token.dto';

// ----------------------------------------------------------------
// Helper nội bộ: ép kiểu an toàn thành object
// ----------------------------------------------------------------

/** Kiểm tra và ép kiểu input thành object – throw nếu không hợp lệ */
function assertObject(input: unknown, context: string): Record<string, unknown> {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new Error(`[auth.mapper] ${context}: dữ liệu không phải object hợp lệ`);
  }
  return input as Record<string, unknown>;
}

/** Lấy chuỗi bắt buộc từ object – throw nếu thiếu hoặc sai kiểu */
function requireString(obj: Record<string, unknown>, key: string, context: string): string {
  const value = obj[key];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`[auth.mapper] ${context}: thiếu hoặc sai kiểu trường "${key}"`);
  }
  return value;
}

/** Lấy mảng string từ object – trả về [] nếu không có */
function extractStringArray(obj: Record<string, unknown>, key: string): string[] {
  const value = obj[key];
  if (!Array.isArray(value)) return [];
  // Lọc chỉ lấy phần tử là string hợp lệ
  return value.filter((item): item is string => typeof item === 'string');
}

// ----------------------------------------------------------------
// Các hàm mapper công khai
// ----------------------------------------------------------------

/**
 * Chuyển đổi dữ liệu thô (từ API) sang AuthUserModel.
 * Dùng cho cả response /auth/login (user) và /auth/me.
 */
export function mapAuthUserDto(input: unknown): AuthUserModel {
  const obj = assertObject(input, 'mapAuthUserDto');

  return {
    id:       requireString(obj, 'id',       'mapAuthUserDto'),
    email:    requireString(obj, 'email',    'mapAuthUserDto'),
    fullName: requireString(obj, 'fullName', 'mapAuthUserDto'),
    roles:       extractStringArray(obj, 'roles'),
    permissions: extractStringArray(obj, 'permissions'),
  };
}

/**
 * Chuyển đổi dữ liệu thô sang LoginResponseDto.
 * Input là phần `data` bên trong response của POST /auth/login.
 */
export function mapLoginResponseDto(input: unknown): LoginResponseDto {
  const obj = assertObject(input, 'mapLoginResponseDto');

  const rawUser = obj['user'];
  const user    = mapAuthUserDto(rawUser);

  return {
    accessToken:  requireString(obj, 'accessToken',  'mapLoginResponseDto'),
    refreshToken: requireString(obj, 'refreshToken', 'mapLoginResponseDto'),
    user,
  };
}

/**
 * Chuyển đổi dữ liệu thô sang RefreshTokenResponseDto.
 * Input là phần `data` bên trong response của POST /auth/refresh.
 * refreshToken là tuỳ chọn – một số backend không luôn trả về.
 */
export function mapRefreshResponseDto(input: unknown): RefreshTokenResponseDto {
  const obj = assertObject(input, 'mapRefreshResponseDto');

  const accessToken  = requireString(obj, 'accessToken', 'mapRefreshResponseDto');

  // refreshToken không bắt buộc
  const rawRefresh = obj['refreshToken'];
  const refreshToken = typeof rawRefresh === 'string' && rawRefresh.trim() !== ''
    ? rawRefresh
    : undefined;

  return { accessToken, refreshToken };
}
