// auth-layout.tsx
// Layout cho trang xác thực – canh giữa màn hình, dùng Tailwind.

import { env } from "@/app/config/env";
import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-8">
      <div className="w-full max-w-md bg-white border border-[var(--color-border)] rounded-2xl p-8 sm:p-10 shadow-xl shadow-blue-900/5 backdrop-blur-sm">
        {/* Header: logo + tên app */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="h-16 w-16 bg-[var(--color-primary)] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <span className="text-3xl">🎓</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {env.APP_NAME}
          </h1>
        </div>

        {/* Nội dung form do trang con cung cấp */}
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
