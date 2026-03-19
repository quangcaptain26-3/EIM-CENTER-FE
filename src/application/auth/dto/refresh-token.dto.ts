// refresh-token.dto.ts
// DTO cho chức năng làm mới access token.
// Tương ứng với API POST /auth/refresh.

/** Dữ liệu gửi lên để refresh token */
export interface RefreshTokenRequestDto {
  refreshToken: string;
}

/**
 * Dữ liệu trả về sau khi refresh thành công.
 * refreshToken là tuỳ chọn – một số backend có thể trả về cả 2 token mới.
 */
export interface RefreshTokenResponseDto {
  accessToken: string;
  refreshToken?: string;
}
