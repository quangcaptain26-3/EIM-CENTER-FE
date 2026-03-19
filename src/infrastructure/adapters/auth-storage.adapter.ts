// auth-storage.adapter.ts
// Adapter cho phần hạ tầng HTTP hoặc State slice gọi vào Auth storage.
// Lật ngược Dependency Inversion để mã nguồn ngoài phụ thuộc vào module Adapter.

import {
  getAccessToken,
  setAccessToken,
  getRefreshToken,
  setRefreshToken,
  clearTokens,
} from '@/shared/lib/token';

export const authStorageAdapter = {
  getAccessToken,
  setAccessToken,

  getRefreshToken,
  setRefreshToken,

  clear: clearTokens,
};
