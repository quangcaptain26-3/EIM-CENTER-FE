// axios.ts
// File index gom API client cấu hình sẵn ra ngoài app layer sử dụng.
// Import file này thay vì gọi Axios gốc trực tiếp!

import { apiClient } from '@/infrastructure/http/api-client';
import { setupInterceptors, setInterceptorCallbacks } from '@/infrastructure/http/interceptors';

// Kích hoạt interceptors ngay khi file được import (chưa có callbacks)
setupInterceptors();

// Export client hoàn chỉnh cho các custom hook gọi API lấy data
export { apiClient };

/**
 * Inject callbacks vào interceptor sau khi Redux store + Router sẵn sàng.
 * Gọi hàm này 1 lần trong AppBootstrap.
 *
 * @param onTokenRefresh - Gọi khi nhận được access token mới (để dispatch setCredentials)
 * @param onAuthFail - Gọi khi không thể refresh (để dispatch clearAuth + redirect)
 */
export const initAxiosAuthHandlers = (callbacks: {
  onTokenRefresh: (newAccessToken: string, newRefreshToken?: string) => void;
  onAuthFail: () => void;
}) => {
  setInterceptorCallbacks(callbacks);
};
