/**
 * src/presentation/components/layout/sidebar-menu.config.ts
 * Cấu hình logic lấy danh sách menu hiển thị trên Sidebar.
 */
import type { AppRouteMeta } from '@/app/router/route-meta';
import { appRouteMetaList } from '@/app/router/route-meta';
import { canAccessRoute } from '@/domain/auth/rules/navigation.rule';

/**
 * Lọc danh sách appRouteMetaList để trả về những menu cần hiển thị cho sidebar,
 * dựa theo quyền của người dùng hiện tại (lấy ra từ auth hook).
 * @param userRoles Danh sách roles của user (ví dụ: ['ROOT'] hoặc ['TEACHER'])
 * @returns Danh sách menu đã được lọc quyền
 */
export function getSidebarMenuByRoles(userRoles?: string[]): AppRouteMeta[] {
  return appRouteMetaList
    // Lọc theo thuộc tính showInSidebar: mặc định hiển thị nếu không quy định cứng 'false'
    .filter((route) => route.showInSidebar !== false)
    // Lấy routing qua luật rules
    .filter((route) => canAccessRoute(userRoles, route.allowedRoles))
    // Cắt map các thành phần child nếu có
    .map((route) => {
      // Nếu có menu con, cũng tiến hành đệ quy lọc lại menu con
      if (route.children && route.children.length > 0) {
         const filteredChildren = route.children
            // Lọc child theo showInSidebar và check quyền
            .filter((child) => child.showInSidebar !== false)
            .filter((child) => canAccessRoute(userRoles, child.allowedRoles));
            
         // Trả về một bản sao chép với mảng children đã lọc
         return {
            ...route,
            children: filteredChildren
         };
      }
      return route;
    });
}
