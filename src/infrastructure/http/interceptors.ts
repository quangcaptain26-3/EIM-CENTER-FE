// interceptors.ts
// Gắn logic tự động trước khi gửi Request và sau khi nhận Response từ Backend.
//
// Các case xử lý lỗi:
// - 401: Tự động gọi refresh token. Nếu refresh thành công → retry request gốc.
//        Nếu refresh thất bại (hoặc đã retry rồi _retry=true) → onAuthFail, redirect login.
// - 403: Redirect sang /forbidden.
// - Khác: Reject ngay, component/hook xử lý (toast, ErrorState).

import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { apiClient } from './api-client';
import { authStorageAdapter } from '../adapters/auth-storage.adapter';
import { env } from '@/app/config/env';

// ----------------------------------------------------------------
// Mở rộng kiểu config để gắn flag retry
// ----------------------------------------------------------------

// Thêm _retry vào InternalAxiosRequestConfig để đánh dấu request đã được thử retry
interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// ----------------------------------------------------------------
// Callbacks injection – tránh import store trực tiếp (circular dep)
// ----------------------------------------------------------------

interface InterceptorCallbacks {
  /** Gọi khi nhận được access token mới từ refresh – để store cập nhật */
  onTokenRefresh?: (newAccessToken: string, newRefreshToken?: string) => void;
  /** Gọi khi refresh thất bại hoặc không có refresh token – để clear auth */
  onAuthFail?: () => void;
}

// Lưu callbacks bên ngoài để updateable sau khi inject từ AppBootstrap
let interceptorCallbacks: InterceptorCallbacks = {};

/** Inject callbacks từ bên ngoài (thường gọi từ AppBootstrap sau khi store sẵn sàng) */
export const setInterceptorCallbacks = (callbacks: InterceptorCallbacks) => {
  interceptorCallbacks = callbacks;
};

// ----------------------------------------------------------------
// Sửa [A1-1]: Queue tránh race condition khi nhiều request cùng nhận 401
// Nếu đang refresh → các request mới xếp hàng chờ kết quả thay vì tự gọi refresh riêng
// ----------------------------------------------------------------

// Flag đánh dấu đang có 1 refresh token request đang chạy
let isRefreshing = false;

// Hàng đợi các request đang chờ refresh hoàn tất
type QueueItem = {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
};
let refreshQueue: QueueItem[] = [];

/** Giải phóng hàng đợi sau khi refresh xong – thành công hoặc thất bại */
const processQueue = (error: unknown, token: string | null) => {
  refreshQueue.forEach((item) => {
    if (error) {
      item.reject(error);
    } else {
      item.resolve(token as string);
    }
  });
  refreshQueue = [];
};

// ----------------------------------------------------------------
// Setup
// ----------------------------------------------------------------

export const setupInterceptors = () => {

  // 1. Request Interceptor: Gắn Access Token vào header trước khi gửi
  apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const accessToken = authStorageAdapter.getAccessToken();

      // Chỉ gắn header nếu có token
      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // 2. Response Interceptor: Bắt lỗi 401 và thử refresh token 1 lần
  apiClient.interceptors.response.use(
    // Thành công: trả thẳng response
    (response) => response,

    async (error: AxiosError) => {
      const originalRequest = error.config as RetryableRequestConfig | undefined;

      // Xử lý 403: API trả không có quyền → redirect trang Forbidden
      if (error.response?.status === 403) {
        window.location.assign('/forbidden');
        return Promise.reject(error);
      }

      // Chỉ xử lý 401 – các lỗi khác reject ngay
      if (error.response?.status !== 401 || !originalRequest) {
        return Promise.reject(error);
      }

      // Nếu request này đã được retry rồi → không thử nữa, clear auth
      if (originalRequest._retry) {
        interceptorCallbacks.onAuthFail?.();
        return Promise.reject(error);
      }

      // Lấy refresh token từ storage
      const refreshToken = authStorageAdapter.getRefreshToken();
      if (!refreshToken) {
        // Không có refresh token → buộc đăng xuất
        interceptorCallbacks.onAuthFail?.();
        return Promise.reject(error);
      }

      // Sửa [A1-1]: Nếu đang refresh → xếp hàng chờ thay vì gọi thêm request refresh
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then((newToken) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return apiClient(originalRequest);
        }).catch((err) => Promise.reject(err));
      }

      // Đánh dấu để tránh retry vòng lặp và bắt đầu refresh
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi refresh qua axios GỐC (không qua apiClient) để tránh kích hoạt interceptor này lại
        const refreshResponse = await axios.post(
          `${env.API_BASE_URL}/auth/refresh`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );

        // Lấy token mới từ response { success: true, data: { accessToken, refreshToken? } }
        const newAccessToken: string = refreshResponse.data?.data?.accessToken;
        const newRefreshToken: string | undefined = refreshResponse.data?.data?.refreshToken;

        if (!newAccessToken) {
          throw new Error('Refresh response không có accessToken');
        }

        // Lưu token mới vào storage
        authStorageAdapter.setAccessToken(newAccessToken);
        if (newRefreshToken) {
          authStorageAdapter.setRefreshToken(newRefreshToken);
        }

        // Thông báo cho store cập nhật token
        interceptorCallbacks.onTokenRefresh?.(newAccessToken, newRefreshToken);

        // Sửa [A1-1]: Giải phóng tất cả request đang xếp hàng với token mới
        processQueue(null, newAccessToken);

        // Patch header Authorization cho request gốc rồi retry
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return apiClient(originalRequest);

      } catch (refreshError) {
        // Sửa [A1-1]: Giải phóng hàng đợi với lỗi, rồi clear auth
        processQueue(refreshError, null);
        interceptorCallbacks.onAuthFail?.();
        return Promise.reject(error);
      } finally {
        // Sửa [A1-1]: Đảm bảo reset flag dù thành công hay thất bại
        isRefreshing = false;
      }
    }
  );
};
