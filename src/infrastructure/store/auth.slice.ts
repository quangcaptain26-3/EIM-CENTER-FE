// auth.slice.ts
// Slice Redux quản lý Auth: lưu Token trên Memory và đồng bộ xuống LocalStorage.

import { createSlice } from '@reduxjs/toolkit';
import type { AuthStateUser } from '@/shared/types/auth.type';
import { authStorageAdapter } from '@/infrastructure/adapters/auth-storage.adapter';

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  // Dùng AuthStateUser thay vì AuthUser để roles đồng bộ với AppRole
  user: AuthStateUser | null;
  initialized: boolean; // true khi app đã kiểm tra token lần đầu xong
}

const initialState: AuthState = {
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,
  user: null,
  initialized: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /** Lưu token và/hoặc user vào state + storage (dùng sau login/refresh) */
    setCredentials: (
      state,
      action: {
        payload: {
          accessToken?: string;
          refreshToken?: string;
          user?: AuthStateUser;
        };
      }
    ) => {
      const { accessToken, refreshToken, user } = action.payload;

      if (accessToken) {
        state.accessToken = accessToken;
        // Đồng bộ xuống localStorage để interceptor đọc được
        authStorageAdapter.setAccessToken(accessToken);
        state.isAuthenticated = true;
      }

      if (refreshToken) {
        state.refreshToken = refreshToken;
        authStorageAdapter.setRefreshToken(refreshToken);
      }

      if (user) {
        state.user = user;
      }
    },

    /** Cập nhật thông tin user (dùng sau getMe) */
    setUser: (state, action: { payload: AuthStateUser }) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },

    /** Xoá toàn bộ auth state và token storage (dùng khi logout / 401 không thể refresh) */
    clearAuth: (state) => {
      state.isAuthenticated = false;
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      authStorageAdapter.clear();
    },

    /** Đánh dấu app đã kiểm tra token lần đầu xong */
    setInitialized: (state, action: { payload: boolean }) => {
      state.initialized = action.payload;
    },
  },
});

export const { setCredentials, setUser, clearAuth, setInitialized } = authSlice.actions;
export default authSlice.reducer;
