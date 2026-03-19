// user-menu.tsx
// Component widget người dùng nằm ở AppBar góc phải, hiển thị Tên / Avatar / Nút Logout

import { useAppSelector } from "@/app/store/hooks";
import { useLogout } from "@/presentation/hooks/auth/use-logout";
import { Button } from "@/shared/ui/button";
import { roleLabels, type AppRole } from "@/shared/constants/roles";
import { LogOut } from "lucide-react";

export const UserMenu = () => {
  const { user } = useAppSelector((state) => state.auth);
  const logoutMutation = useLogout();

  // Fallback displayName
  const displayName = user?.fullName || user?.email || "Người dùng EIM";

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="relative flex items-center gap-3 md:gap-4">
      {/* Thông tin Text cơ bản */}
      <div className="hidden md:flex flex-col text-right">
        <span className="text-sm font-bold text-slate-800 tracking-tight leading-none">
          {displayName}
        </span>
        <span className="text-xs font-semibold text-slate-500 mt-1 max-w-[150px] truncate leading-none">
          {user?.roles
            ?.map((role) => roleLabels[role as AppRole] || role)
            .join(", ") || "Chưa phân quyền"}
        </span>
      </div>

      {/* Avatar giả lập (Chữ cái đầu tên) */}
      <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-600 text-white font-extrabold text-lg shadow-md shadow-indigo-500/20 ring-[3px] ring-white cursor-pointer hover:scale-105 transition-transform shrink-0">
        {displayName.charAt(0).toUpperCase()}
      </div>

      {/* Nút thoát */}
      <Button
        variant="danger"
        size="sm"
        onClick={handleLogout}
        className="ml-1 px-3 h-10 rounded-xl hover:bg-rose-50 hover:text-rose-600 border border-transparent hover:border-rose-200 bg-transparent text-slate-400 cursor-pointer transition-all shadow-none shrink-0"
        title="Đăng xuất"
        loading={logoutMutation.isPending}
      >
        {!logoutMutation.isPending && (
          <LogOut className="h-4 w-4" strokeWidth={2.5} />
        )}
      </Button>
    </div>
  );
};
