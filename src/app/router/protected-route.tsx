// protected-route.tsx
// Component bảo vệ route – chỉ cho phép truy cập khi đã đăng nhập.
// Khi chưa initialized (app đang khởi động) → không redirect ngay để tránh nhầm.

import { Navigate } from "react-router-dom";
import { RoutePaths } from "@/app/router/route-paths";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  /** Trạng thái xác thực (lấy từ Redux store) */
  isAuthenticated: boolean;
  /** App đã kiểm tra token lần đầu xong chưa (từ useInitAuth) */
  initialized?: boolean;
  /** Trang redirect khi chưa đăng nhập (mặc định là /login) */
  redirectTo?: string;
  children: ReactNode;
}

const ProtectedRoute = ({
  isAuthenticated,
  initialized = true,
  redirectTo = RoutePaths.LOGIN,
  children,
}: ProtectedRouteProps) => {
  // Chưa initialized → render null để tránh redirect nhầm trong lúc đang kiểm tra token
  // (AppBootstrap đã render Loading, nên null ở đây không gây màn hình trắng)
  if (!initialized) {
    return null;
  }

  // Đã khởi tạo xong nhưng chưa đăng nhập → redirect về login
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Đã đăng nhập → render nội dung trang
  return <>{children}</>;
};

export default ProtectedRoute;
