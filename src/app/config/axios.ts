import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import type { ApiError } from '@/shared/types/api.type';
import { toast } from 'sonner';
import { store } from '@/app/store';
import { clearAuth } from '@/app/store/auth.slice';

const ACCESS_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';

const getAccessToken = () => localStorage.getItem(ACCESS_KEY);
const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);

const DEFAULT_BASE = 'http://localhost:3000/api/v1';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || DEFAULT_BASE,
  timeout: 60_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

type Waiter = {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
};

let isRefreshing = false;
const failedQueue: Waiter[] = [];

// Gom các request 401 xảy ra đồng thời để chỉ refresh token 1 lần.
function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else if (token) resolve(token);
    else reject(error ?? new Error('AUTH_REFRESH_FAILED'));
  });
  failedQueue.length = 0;
}

function requestUrl(config?: AxiosRequestConfig): string {
  const base = (config?.baseURL ?? apiClient.defaults.baseURL ?? '') as string;
  const u = config?.url ?? '';
  return `${base}${u}`;
}

function shouldSkipRefreshFor401(config?: InternalAxiosRequestConfig): boolean {
  const full = requestUrl(config);
  return (
    full.includes('/auth/login') ||
    full.includes('/auth/refresh') ||
    full.includes('/auth/logout')
  );
}

type RetryConfig = InternalAxiosRequestConfig & { _authRetry?: boolean };

function normalizeAxiosError(error: AxiosError): ApiError {
  const httpStatus = error.response?.status ?? 0;
  const raw = error.response?.data;

  if (raw && typeof raw === 'object') {
    const o = raw as Record<string, unknown>;
    const fromErrorField = typeof o.error === 'string' ? o.error : '';
    const code =
      typeof o.code === 'string'
        ? o.code
        : fromErrorField && /^[A-Z][A-Z0-9_]*$/.test(fromErrorField)
          ? fromErrorField
          : 'UNKNOWN_ERROR';
    const message =
      typeof o.message === 'string'
        ? o.message
        : fromErrorField
          ? fromErrorField
          : 'Có lỗi xảy ra, vui lòng thử lại sau';
    const details = o.details !== undefined ? o.details : o.errors;
    const requestId =
      typeof o.request_id === 'string'
        ? o.request_id
        : typeof o.requestId === 'string'
          ? o.requestId
          : undefined;
    return { code, message, details, httpStatus, requestId };
  }

  if (error.request && !error.response) {
    return {
      code: 'NETWORK_ERROR',
      message: 'Không thể kết nối đến server',
      httpStatus: 0,
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: error.message || 'Có lỗi xảy ra, vui lòng thử lại sau',
    httpStatus,
  };
}

function extractTokenPair(body: unknown): { accessToken: string; refreshToken: string } | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as Record<string, unknown>;

  const tryPair = (obj: Record<string, unknown>) => {
    if (
      typeof obj.accessToken === 'string' &&
      typeof obj.refreshToken === 'string'
    ) {
      return { accessToken: obj.accessToken, refreshToken: obj.refreshToken };
    }
    return null;
  };

  const direct = tryPair(b);
  if (direct) return direct;

  const nested = b.data;
  if (nested && typeof nested === 'object') {
    return tryPair(nested as Record<string, unknown>);
  }
  return null;
}

function redirectToLogin(options?: { sessionExpired?: boolean }) {
  if (options?.sessionExpired) {
    toast.info('Phiên đăng nhập hết hạn');
  }
  store.dispatch(clearAuth());
  const path = `${window.location.pathname}${window.location.search}`;
  if (!path.startsWith('/auth/login')) {
    window.location.assign('/auth/login');
  }
}

apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig | undefined;

    if (
      originalRequest &&
      error.response?.status === 401 &&
      !shouldSkipRefreshFor401(originalRequest)
    ) {
      if (originalRequest._authRetry) {
        redirectToLogin({ sessionExpired: true });
        return Promise.reject(normalizeAxiosError(error));
      }

      if (isRefreshing) {
        // Request đến sau sẽ chờ request refresh đầu tiên xử lý xong.
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            const h = originalRequest.headers ?? new AxiosHeaders();
            originalRequest.headers = h;
            h.set('Authorization', `Bearer ${token}`);
            originalRequest._authRetry = true;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        redirectToLogin({ sessionExpired: true });
        return Promise.reject(normalizeAxiosError(error));
      }

      isRefreshing = true;

      try {
        const { data: body } = await axios.post(
          `${apiClient.defaults.baseURL}/auth/refresh`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } },
        );

        const tokens = extractTokenPair(body);
        if (!tokens) {
          throw new Error('Invalid refresh response');
        }

        localStorage.setItem(ACCESS_KEY, tokens.accessToken);
        localStorage.setItem(REFRESH_KEY, tokens.refreshToken);

        isRefreshing = false;
        processQueue(null, tokens.accessToken);

        const h = originalRequest.headers ?? new AxiosHeaders();
        originalRequest.headers = h;
        h.set('Authorization', `Bearer ${tokens.accessToken}`);
        originalRequest._authRetry = true;
        return apiClient(originalRequest);
      } catch (refreshErr) {
        isRefreshing = false;
        processQueue(refreshErr, null);
        redirectToLogin({ sessionExpired: true });
        return Promise.reject(
          refreshErr instanceof AxiosError
            ? normalizeAxiosError(refreshErr)
            : normalizeAxiosError(error),
        );
      }
    }

    return Promise.reject(error instanceof AxiosError ? normalizeAxiosError(error) : error);
  },
);
