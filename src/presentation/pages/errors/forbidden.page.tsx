// forbidden.page.tsx
// Trang lỗi 403, dùng Tailwind classes.

import { Link } from "react-router-dom";
import { RoutePaths } from "@/app/router/route-paths";

const ForbiddenPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-bg)] px-6 text-center">
      {/* Số lỗi lớn */}
      <p className="text-[9rem] font-extrabold text-red-500 opacity-10 leading-none mb-4">
        403
      </p>
      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">
        Không có quyền truy cập
      </h1>
      <p className="text-sm text-[var(--color-text-muted)] mb-8 leading-relaxed">
        Tài khoản của bạn không có quyền xem trang này.
        <br />
        Liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.
      </p>
      <Link
        to={RoutePaths.DASHBOARD}
        className="px-6 py-2.5 border-2 border-[var(--color-primary)] text-[var(--color-primary)] rounded-lg font-semibold text-sm hover:bg-[var(--color-primary)] hover:text-white transition-colors duration-200"
      >
        ← Quay về Dashboard
      </Link>
    </div>
  );
};

export default ForbiddenPage;
