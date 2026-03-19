// app-provider.tsx
// Provider tổng hợp – bọc toàn bộ app theo đúng thứ tự ưu tiên.
// Thứ tự: StoreProvider → QueryProvider → AppBootstrap → ToastProvider → Router
//
// AppBootstrap được đặt trong StoreProvider + QueryProvider để có thể:
//  - Gọi useInitAuth (cần store)
//  - Inject callbacks vào axios interceptors (cần store + dispatch)

import { useEffect } from "react";
import StoreProvider from "./store-provider";
import QueryProvider from "./query-provider";
import ToastProvider from "./toast-provider";
import RouterProviderWrapper from "./router-provider";
import { Loading } from "@/shared/ui/feedback/loading";
import { useInitAuth } from "@/presentation/hooks/auth/use-init-auth";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { setCredentials, clearAuth } from "@/infrastructure/store/auth.slice";
import { initAxiosAuthHandlers } from "@/app/config/axios";
import type { ReactNode } from "react";

// ----------------------------------------------------------------
// AppBootstrap: chạy khởi tạo auth + inject interceptor callbacks
// ----------------------------------------------------------------

function AppBootstrap({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const initialized = useAppSelector((s) => s.auth.initialized);

  // Khởi tạo session: đọc token từ storage, gọi getMe, refresh nếu cần
  useInitAuth();

  useEffect(() => {
    // Inject callbacks vào interceptors để interceptor có thể cập nhật store
    // mà không import store trực tiếp (tránh circular dependency)
    initAxiosAuthHandlers({
      onTokenRefresh: (newAccessToken, newRefreshToken) => {
        dispatch(
          setCredentials({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          }),
        );
      },
      onAuthFail: () => {
        dispatch(clearAuth());
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Chờ useInitAuth hoàn tất trước khi render app
  if (!initialized) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loading text="Đang khởi động hệ thống..." />
      </div>
    );
  }

  return <>{children}</>;
}

// ----------------------------------------------------------------
// AppProvider: composing tất cả provider theo đúng thứ tự
// ----------------------------------------------------------------

interface AppProviderProps {
  children?: ReactNode;
}

const AppProvider = ({ children }: AppProviderProps) => {
  return (
    <StoreProvider>
      <QueryProvider>
        <AppBootstrap>
          <ToastProvider>{children ?? <RouterProviderWrapper />}</ToastProvider>
        </AppBootstrap>
      </QueryProvider>
    </StoreProvider>
  );
};

export default AppProvider;
