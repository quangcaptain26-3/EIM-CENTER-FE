// toast-provider.tsx
// Provider hiển thị thông báo toast toàn cục bằng thư viện Sonner.
// Đặt ở gần root để toast luôn hiển thị trên tất cả màn hình.

import type { ReactNode } from "react";
import { AppToaster } from "@/shared/ui/toaster";

interface ToastProviderProps {
  children: ReactNode;
}

const ToastProvider = ({ children }: ToastProviderProps) => {
  return (
    <>
      {children}
      <AppToaster />
    </>
  );
};

export default ToastProvider;
