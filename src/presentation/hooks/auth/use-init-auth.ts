// use-init-auth.ts
// Hook khởi tạo auth khi app mount lần đầu.
// Mục tiêu: restore session từ token trong localStorage (nếu có).
// Chạy ĐỘC lập – không phụ thuộc React Query để tránh racing với useMe.

import { useEffect } from 'react';
import { useAppDispatch } from '@/app/store/hooks';
import { setCredentials, setUser, clearAuth, setInitialized } from '@/infrastructure/store/auth.slice';
import { getMeUseCase } from '@/application/auth/use-cases/get-me.use-case';
import { refreshTokenUseCase } from '@/application/auth/use-cases/refresh-token.use-case';
import { authStorageAdapter } from '@/infrastructure/adapters/auth-storage.adapter';
import type { AuthStateUser } from '@/shared/types/auth.type';

export function useInitAuth() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Chỉ chạy đúng 1 lần khi mount
    let cancelled = false;

    const init = async () => {
      const accessToken  = authStorageAdapter.getAccessToken();
      const refreshToken = authStorageAdapter.getRefreshToken();

      // Không có token nào → chưa đăng nhập, xong ngay
      if (!accessToken && !refreshToken) {
        dispatch(setInitialized(true));
        return;
      }

      try {
        // Thử lấy user bằng access token hiện tại (interceptor sẽ xử lý 401)
        const user = await getMeUseCase();
        if (!cancelled) {
          dispatch(setUser({ ...user } as AuthStateUser));
        }
      } catch {
        // getMe thất bại → thử refresh nếu có refreshToken
        if (refreshToken) {
          try {
            const refreshData = await refreshTokenUseCase({ refreshToken });
            if (!cancelled) {
              // Lưu token mới vào store + storage
              dispatch(setCredentials({
                accessToken:  refreshData.accessToken,
                refreshToken: refreshData.refreshToken,
              }));
            }
            // Gọi lại getMe với token mới
            const user = await getMeUseCase();
            if (!cancelled) {
              dispatch(setUser({ ...user } as AuthStateUser));
            }
          } catch {
            // Refresh cũng thất bại → xoá auth
            if (!cancelled) {
              dispatch(clearAuth());
            }
          }
        } else {
          // Không có refreshToken → xoá auth
          if (!cancelled) {
            dispatch(clearAuth());
          }
        }
      } finally {
        // Luôn đánh dấu đã khởi tạo xong dù thành công hay thất bại
        if (!cancelled) {
          dispatch(setInitialized(true));
        }
      }
    };

    init();

    // Cleanup nếu component unmount trước khi async xong
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
