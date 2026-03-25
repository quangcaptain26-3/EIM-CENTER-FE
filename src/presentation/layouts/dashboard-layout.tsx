// dashboard-layout.tsx
// Layout bọc cấp toàn hệ thống, áp dụng ProtectedRoute bên ngoài.
// Kết hợp Sidebar + Header + Container Chính (flex) trong lớp CSS custom gọn gàng.

import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { setSidebarOpen } from "@/infrastructure/store/ui.slice";

import { AppSidebar } from "../components/layout/app-sidebar";
import { AppHeader } from "../components/layout/app-header";
import { cn } from "@/shared/lib/cn";

export const DashboardLayout = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { sidebarOpen } = useAppSelector((s) => s.ui);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && sidebarOpen) {
        dispatch(setSidebarOpen(false));
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch, sidebarOpen]);

  useEffect(() => {
    if (window.innerWidth < 768) {
      dispatch(setSidebarOpen(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans antialiased selection:bg-indigo-100 selection:text-indigo-900">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-60 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 md:hidden"
          onClick={() => dispatch(setSidebarOpen(false))}
          aria-hidden="true"
        />
      )}

      <div className="flex flex-1 w-full relative">
        {/* Sidebar maintains its own fixed positioning context in its component, 
            but we need to handle the content offset here */}
        <AppSidebar />

        <div
          className={cn(
            "flex flex-col min-h-screen min-w-0 flex-1 transition-all duration-400 ease-in-out",
            sidebarOpen ? "md:ml-[280px]" : "md:ml-[88px]",
          )}
        >
          <AppHeader />
          <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-10 max-w-[1600px] w-full mx-auto">
            <Outlet />
          </main>

          <footer className="py-6 px-10 border-t border-slate-200/50 text-slate-400 text-xs font-medium flex justify-between items-center">
            <p>© {currentYear} EIM Management System. All rights reserved.</p>
            <div className="flex gap-4">
              <span className="hover:text-indigo-500 cursor-pointer transition-colors">
                Documentation
              </span>
              <span className="hover:text-indigo-500 cursor-pointer transition-colors">
                Support
              </span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};
