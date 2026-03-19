import { useSidebarMenu } from "@/presentation/hooks/system/use-sidebar-menu";
import { AppSidebarItem } from "./app-sidebar-item";
import { NavSectionTitle } from "../common/nav-section-title";
import { env } from "@/app/config/env";
import { cn } from "@/shared/lib/cn";

import {
  LayoutDashboard,
  BookOpen,
  Users,
  School,
  ClipboardList,
  Wallet,
  Bell,
  ShieldCheck,
  CircleDot,
} from "lucide-react";

// Ánh xạ key icon sang Lucide component
const IconMap: Record<string, React.ComponentType<any>> = {
  dashboard: LayoutDashboard,
  book: BookOpen,
  users: Users,
  "chalkboard-teacher": School,
  "calendar-alt": ClipboardList,
  "dollar-sign": Wallet,
  cogs: Bell, // Mặc định system icon
  notifications: Bell,
  "audit-logs": ShieldCheck,
  "user-management": Users,
};

// Hàm tiện ích lấy Icon
const getMenuIcon = (iconKey?: string) => {
  if (!iconKey) return CircleDot;
  return IconMap[iconKey] || CircleDot;
};

export const AppSidebar = () => {
  const { menuItems, sidebarOpen, closeSidebar } = useSidebarMenu();

  // Xử lý auto close khi click menu ở màn mobile
  const handleItemClick = () => {
    if (window.innerWidth < 768) {
      closeSidebar();
    }
  };

  return (
    <aside
      className={cn(
        "app-sidebar-container transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]",
        "flex flex-col bg-white border-r border-slate-200/70 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-50",
        sidebarOpen
          ? "translate-x-0 w-[280px]"
          : "w-[88px] -translate-x-full md:translate-x-0",
      )}
    >
      {/* Header Sidebar */}
      <div
        className={cn(
          "flex h-20 shrink-0 items-center border-b border-slate-100 transition-all duration-300",
          sidebarOpen ? "px-8 justify-start" : "px-0 justify-center",
        )}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20">
          <School className="h-6 w-6" strokeWidth={2.25} />
        </div>

        <h2
          className={cn(
            "ml-3.5 truncate text-[1.3rem] font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-950 to-slate-800 transition-all duration-300",
            sidebarOpen
              ? "opacity-100 translate-x-0"
              : "w-0 opacity-0 -translate-x-4 hidden md:block",
          )}
        >
          {env.APP_NAME || "EIM Center"}
        </h2>
      </div>

      {/* Menu List */}
      <nav className="custom-scrollbar flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {menuItems.map((item: any) => {
          // Render items có child hoặc không child
          // Để bài tập mức cơ bản, ta render flat menu (nếu có child thì map thẳng child luôn hoặc tùy UI design).
          // Ở đây map phẳng luôn các con nếu route cha không có path cụ thể.

          const renderItem = (menuItem: Record<string, any>) => {
            const Icon = getMenuIcon(menuItem.key);

            return (
              <AppSidebarItem
                key={menuItem.key}
                label={menuItem.label}
                to={menuItem.path}
                icon={Icon}
                isSidebarOpen={sidebarOpen}
                onClick={handleItemClick}
              />
            );
          };

          // Nếu item này có con thì bóc tách render
          if (item.children && item.children.length > 0) {
            return (
              <div key={item.key} className="space-y-1 mb-2">
                {/* Có thể render group title ở đây nếu Sidebar Mở */}
                {sidebarOpen && <NavSectionTitle label={item.label} />}
                {item.children.map((child: Record<string, any>) =>
                  renderItem({ ...child, key: child.icon || child.key }),
                )}
              </div>
            );
          }

          return renderItem(item);
        })}
      </nav>

      {/* Footer Sidebar */}
      <div
        className={cn(
          "mt-auto border-t border-slate-100 p-5 transition-all duration-300",
          !sidebarOpen ? "px-2 pb-6" : "",
        )}
      >
        <div
          className={cn(
            "rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden transition-all duration-300 flex flex-col items-center justify-center text-center",
            sidebarOpen ? "p-4" : "p-2 py-3",
          )}
        >
          {sidebarOpen ? (
            <>
              <p className="text-sm font-bold text-slate-700">EIM Center</p>
              <p className="text-xs font-medium text-slate-400 mt-0.5">
                Admin Portal v1.0
              </p>
            </>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 font-bold text-xs">
              v1
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
