// toast-provider.tsx
// Provider hiển thị thông báo toast toàn cục bằng thư viện Sonner.
// Đặt ở gần root để toast luôn hiển thị trên tất cả màn hình.

import { Toaster } from "sonner";
import type { ReactNode } from "react";

interface ToastProviderProps {
  children: ReactNode;
}

const ToastProvider = ({ children }: ToastProviderProps) => {
  return (
    <>
      {children}
      {/* Toaster của Sonner – hiển thị toast ở góc trên bên phải */}
      <Toaster position="top-right" richColors closeButton duration={4000} />
    </>
  );
};

export default ToastProvider;
