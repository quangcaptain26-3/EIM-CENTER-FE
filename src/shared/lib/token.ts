// token.ts
// Quản lý nghiệp vụ lưu trữ Token của ứng dụng.
// Không xuất trực tiếp thư viện storage bên dưới mà đóng gói qua hàm nghiệp vụ.

import { getStorageItem, setStorageItem, removeStorageItem } from './storage';

// Hằng số chìa khoá localStorage
export const ACCESS_TOKEN_KEY = 'eim_access_token';
export const REFRESH_TOKEN_KEY = 'eim_refresh_token';

export const getAccessToken = (): string | null => {
  return getStorageItem<string>(ACCESS_TOKEN_KEY);
};

export const setAccessToken = (token: string): void => {
  setStorageItem(ACCESS_TOKEN_KEY, token);
};

export const removeAccessToken = (): void => {
  removeStorageItem(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  return getStorageItem<string>(REFRESH_TOKEN_KEY);
};

export const setRefreshToken = (token: string): void => {
  setStorageItem(REFRESH_TOKEN_KEY, token);
};

export const clearTokens = (): void => {
  removeAccessToken();
  removeStorageItem(REFRESH_TOKEN_KEY);
};
