// dashboard.page.tsx
// Trang tổng quan chính của Admin. Bỏ PageShell tĩnh thay bằng DashboardLayout
// Sử dụng các component nền tảng chuẩn: PageTitle, StatusBadge.

import { env } from "@/app/config/env";
import { RoutePaths } from "@/app/router/route-paths";
import { AppRoles } from "@/shared/constants/roles";
import { useAuth } from "@/presentation/hooks/auth/use-auth";
import { canAccessRoute } from "@/domain/auth/rules/navigation.rule";

import { DashboardWelcome } from "@/presentation/components/dashboard/dashboard-welcome";
import { DashboardShortcutCard } from "@/presentation/components/dashboard/dashboard-shortcut-card";
import { EmptyState } from "@/shared/ui/feedback/empty";

import {
  BookOpen,
  GraduationCap,
  Users,
  CalendarHeart,
  Receipt,
  Bell,
  ShieldCheck,
  CreditCard,
  MessageSquare,
} from "lucide-react";

// Định nghĩa cấu trúc mảng shortcut card để dễ filter theo role
interface ShortcutConfig {
  id: string;
  title: string;
  description: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles?: string[];
}

const ALL_SHORTCUTS: ShortcutConfig[] = [
  {
    id: "curriculum",
    title: "Chương trình học",
    description: "Quản lý chương trình, khoá học và bài giảng",
    to: RoutePaths.CURRICULUM_PROGRAMS,
    icon: BookOpen,
    allowedRoles: [AppRoles.ROOT, AppRoles.DIRECTOR, AppRoles.ACADEMIC],
  },
  {
    id: "students",
    title: "Học viên",
    description: "Danh sách học viên, hợp đồng và lịch sử ghi danh",
    to: RoutePaths.STUDENTS,
    icon: GraduationCap,
    allowedRoles: [
      AppRoles.ROOT,
      AppRoles.DIRECTOR,
      AppRoles.ACADEMIC,
      AppRoles.SALES,
      AppRoles.ACCOUNTANT,
    ],
  },
  {
    id: "classes",
    title: "Lớp học",
    description: "Quản lý danh sách lớp, buổi học và điểm danh",
    to: RoutePaths.CLASSES,
    icon: Users,
    allowedRoles: [
      AppRoles.ROOT,
      AppRoles.DIRECTOR,
      AppRoles.ACADEMIC,
      AppRoles.TEACHER,
    ],
  },
  {
    id: "trials",
    title: "Học thử",
    description: "Sắp xếp lịch học thử cho học viên tiềm năng",
    to: RoutePaths.TRIALS,
    icon: CalendarHeart,
    allowedRoles: [
      AppRoles.ROOT,
      AppRoles.DIRECTOR,
      AppRoles.ACADEMIC,
      AppRoles.SALES,
    ],
  },
  {
    id: "finance",
    title: "Hoá đơn học phí",
    description: "Quản lý hoá đơn, thu chi và báo cáo tài chính",
    to: RoutePaths.INVOICES,
    icon: Receipt,
    allowedRoles: [AppRoles.ROOT, AppRoles.DIRECTOR, AppRoles.ACCOUNTANT],
  },
  {
    id: "finance-debt",
    title: "Thanh toán / Công nợ",
    description: "Theo dõi kỳ phí và lịch sử đóng tiền",
    // Sửa [B3]: FINANCE_ROOT (/finance) không có route handler → dẫn đến 404; dùng INVOICES thay thế
    to: RoutePaths.INVOICES,
    icon: CreditCard,
    allowedRoles: [AppRoles.ROOT, AppRoles.DIRECTOR, AppRoles.ACCOUNTANT],
  },
  {
    id: "teacher-classes",
    title: "Lớp của tôi",
    description: "Lịch dạy và danh sách học viên hiện tại",
    to: RoutePaths.CLASSES,
    icon: Users,
    allowedRoles: [AppRoles.TEACHER],
  },
  {
    id: "teacher-reports",
    title: "Nhận xét học viên",
    description: "Đánh giá định kỳ, chấm điểm cuối khoá",
    to: RoutePaths.STUDENTS,
    icon: MessageSquare,
    allowedRoles: [AppRoles.TEACHER],
  },
  {
    id: "notifications",
    title: "Thông báo",
    description: "Xem các thông báo mới từ hệ thống",
    to: RoutePaths.NOTIFICATIONS,
    icon: Bell,
    allowedRoles: [
      AppRoles.ROOT,
      AppRoles.DIRECTOR,
      AppRoles.ACADEMIC,
      AppRoles.SALES,
      AppRoles.ACCOUNTANT,
      AppRoles.TEACHER,
    ],
  },
  {
    id: "audit-logs",
    title: "Nhật ký hệ thống",
    description: "Tra cứu lịch sử thao tác của nhân viên",
    to: RoutePaths.AUDIT_LOGS,
    icon: ShieldCheck,
    allowedRoles: [AppRoles.ROOT, AppRoles.DIRECTOR],
  },
];

const DashboardPage = () => {
  const { user } = useAuth();
  const userRoles = user?.roles || [];

  // Lọc các shortcut mà user có quyền truy cập
  const visibleShortcuts = ALL_SHORTCUTS.filter((shortcut) =>
    canAccessRoute(userRoles, shortcut.allowedRoles),
  );

  return (
    <div className="space-y-6">
      {/* 1. Phần Welcome User (Thay thế PageTitle đơn điệu) */}
      <DashboardWelcome
        fullName={user?.fullName}
        email={user?.email}
        roles={user?.roles}
      />

      {/* 2. Phần Shortcut Cards */}
      {visibleShortcuts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
          {visibleShortcuts.map((card) => (
            <DashboardShortcutCard
              key={card.id}
              title={card.title}
              description={card.description}
              to={card.to}
              icon={card.icon}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Không có chức năng"
          description="Tài khoản của bạn chưa được cấp quyền truy cập các module chính. Vui lòng liên hệ Admin."
          className="bg-white rounded-xl border border-gray-100 py-20"
        />
      )}

      {/* 3. Status hệ thống - Refined */}
      <div className="relative overflow-hidden rounded-[2.5rem] p-6 sm:p-10 bg-white border border-slate-100 shadow-sm mt-12 group transition-all duration-500 hover:shadow-xl hover:border-emerald-100">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transform translate-x-4 -translate-y-4 transition-all duration-700 group-hover:scale-125 group-hover:rotate-12 bg-emerald-500 rounded-full blur-3xl w-64 h-64" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1">
            <h3 className="text-xl font-black text-slate-900 mb-2 flex items-center gap-3">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
              </span>
              Hệ thống đang hoạt động tối ưu
            </h3>
            <p className="text-base text-slate-500 leading-relaxed max-w-2xl font-medium">
              Môi trường{" "}
              <strong className="text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-100/50">
                {env.APP_ENV}
              </strong>{" "}
              đang trực tuyến với hiệu suất cao nhất. Các module đã sẵn sàng
              phục vụ quy trình làm việc của bạn.
            </p>
          </div>

          <div className="px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-3 group-hover:bg-emerald-50 group-hover:text-emerald-700 group-hover:border-emerald-100 transition-all">
            <ShieldCheck className="w-4 h-4" />
            Vận hành an toàn
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
