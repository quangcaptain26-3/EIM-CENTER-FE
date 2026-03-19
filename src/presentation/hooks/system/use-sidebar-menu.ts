/**
 * src/presentation/hooks/system/use-sidebar-menu.ts
 * Hook xử lý logic cấp danh sách menu cho sidebar và điều khiển đóng/mở sidebar.
 */
import { useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { toggleSidebar, closeSidebar } from "@/infrastructure/store/ui.slice";
import { getSidebarMenuByRoles } from "@/presentation/components/layout/sidebar-menu.config";

export function useSidebarMenu() {
  const dispatch = useAppDispatch();
  const { sidebarOpen } = useAppSelector((state) => state.ui);
  const { user } = useAppSelector((state) => state.auth);

  // Lọc ra các menu phù hợp cho user hiện tại, ngăn memo re-render nếu roles không đổi
  const menuItems = useMemo(() => {
    // Mặc định cung cấp roles từ auth slice, nếu null có thể truyền undefined/rỗng
    return getSidebarMenuByRoles(user?.roles);
  }, [user?.roles]);

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  const handleCloseSidebar = () => {
    dispatch(closeSidebar());
  };

  return {
    menuItems,
    sidebarOpen,
    toggleSidebar: handleToggleSidebar,
    closeSidebar: handleCloseSidebar,
  };
}
