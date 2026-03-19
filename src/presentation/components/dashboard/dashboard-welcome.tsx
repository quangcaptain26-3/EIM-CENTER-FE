/**
 * src/presentation/components/dashboard/dashboard-welcome.tsx
 * Component hiển thị lời chào mừng người dùng trên trang Dashboard
 */
import type { AppRole } from "@/shared/constants/roles";
import { roleLabels } from "@/shared/constants/roles";
import { Badge } from "@/shared/ui/badge";

interface DashboardWelcomeProps {
  fullName?: string;
  email?: string;
  roles?: string[];
}

export const DashboardWelcome = ({
  fullName,
  email,
  roles = [],
}: DashboardWelcomeProps) => {
  const displayName = fullName || email || "Khách";

  // Lấy role chính đầu tiên để hiển thị, nếu không có trả về fallback
  const firstRole = roles.length > 0 ? (roles[0] as AppRole) : undefined;
  const displayRoleLabel =
    firstRole && roleLabels[firstRole]
      ? roleLabels[firstRole]
      : "Chưa phân quyền";

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white rounded-[2.5rem] p-6 md:p-10 mb-8 border border-white/5 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      {/* Background decoration with animated glow */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none animate-pulse duration-[4000ms]" />
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="flex flex-col z-10 relative">
        <h1 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">
          Xin chào,{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-indigo-200">
            {displayName}
          </span>
          ! 👋
        </h1>
        <p className="text-blue-100/70 text-base flex items-center gap-2 font-medium">
          Hôm nay bạn muốn làm gì trong hệ thống?
        </p>
      </div>

      <div className="flex flex-col items-start md:items-end gap-2.5 z-10 shrink-0 bg-white/5 backdrop-blur-xl px-5 py-4 rounded-3xl border border-white/10 shadow-lg">
        <div className="text-[10px] text-blue-300 font-bold uppercase tracking-[0.2em]">
          Vai trò hiện tại
        </div>
        <Badge
          variant="default"
          className="text-sm px-4 py-1 shadow-md font-bold bg-white text-indigo-950 hover:bg-white transition-all border-0 rounded-full ring-2 ring-indigo-500/20"
        >
          {displayRoleLabel}
        </Badge>
        {roles.length > 1 && (
          <div className="text-[10px] text-indigo-200/60 mt-0.5 font-bold uppercase tracking-wider">
            +{roles.length - 1} vai trò khác
          </div>
        )}
      </div>
    </div>
  );
};
