// app-header.tsx
// Thanh điều hướng ngang cao nhất (AppBar).
// Chứa Nút điều khiển Menu Sidebar và User menu thả xuống.

import { Menu } from "lucide-react";
import { useSidebarMenu } from "@/presentation/hooks/system/use-sidebar-menu";
import { useRouteMeta } from "@/presentation/hooks/system/use-route-meta";
import { Breadcrumb } from "./breadcrumb";
import { UserMenu } from "./user-menu";
import { NotificationBell } from "../system/notification-bell";

export const AppHeader = () => {
  const { toggleSidebar } = useSidebarMenu();
  const { currentRouteMeta, breadcrumbItems } = useRouteMeta();

  // Chuyển format từ route meta sang format của Breadcrumb component
  const breadcrumbRenderItems = breadcrumbItems.map((item) => ({
    label: item.label,
    href: item.path,
  }));

  return (
    <header className="flex h-20 w-full items-center justify-between border-b border-slate-200/60 bg-white/80 backdrop-blur-xl px-4 md:px-8 z-40 sticky top-0 shadow-sm transition-all duration-300 text-slate-800">
      {/* Left */}
      <div className="flex items-center gap-5 flex-1">
        <button
          onClick={toggleSidebar}
          className="rounded-xl p-2.5 text-slate-500 bg-slate-50 border border-slate-200/50 shadow-sm transition-all hover:bg-white hover:text-indigo-600 hover:border-indigo-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          aria-label="Đóng mở Menu Trái"
          type="button"
        >
          <Menu className="h-5 w-5" strokeWidth={2.5} />
        </button>

        {/* Breadcrumb / page title */}
        <div className="hidden sm:flex flex-col justify-center">
          {breadcrumbRenderItems.length > 0 && (
            <Breadcrumb
              items={breadcrumbRenderItems}
              className="mb-1 text-xs font-medium text-slate-500"
            />
          )}
          <h1 className="text-xl font-extrabold tracking-tight text-slate-800 leading-tight">
            {currentRouteMeta?.label || "Tổng quan"}
          </h1>
        </div>
      </div>

      {/* Right */}
      <div className="ml-auto flex items-center gap-2 md:gap-4">
        <NotificationBell />
        <div className="h-8 w-px bg-slate-200 hidden sm:block mx-1" />
        <UserMenu />
      </div>
    </header>
  );
};
