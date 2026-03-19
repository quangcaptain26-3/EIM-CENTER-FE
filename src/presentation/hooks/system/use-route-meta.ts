/**
 * src/presentation/hooks/system/use-route-meta.ts
 * Hook cung cấp thông tin metadata của route hiện tại
 * Bao gồm: pathname, list breadcrumb items, và helper check route active
 */
import { useLocation } from "react-router-dom";
import { useMemo } from "react";
import { appRouteMetaList } from "@/app/router/route-meta";
import { getBreadcrumbItems } from "@/presentation/components/layout/breadcrumb.config";
import { matchPath } from "react-router-dom";

export function useRouteMeta() {
  const location = useLocation();
  const { pathname } = location;

  // Trả về danh sách cấu trúc breadcrumb cho header/layout hiển thị
  const breadcrumbItems = useMemo(() => {
    return getBreadcrumbItems(pathname);
  }, [pathname]);

  // Tìm meta của route hiện tại ở cấp deep nhất (last item in breadcrumbs)
  // Giả định label cuối cùng match config, mình check qua logic cơ bản
  const currentRouteMeta = useMemo(() => {
    const flatRoutes = (routes: any[]): any[] => {
      let result: any[] = [];
      for (const route of routes) {
        result.push(route);
        if (route.children) {
          result = [...result, ...flatRoutes(route.children)];
        }
      }
      return result;
    };

    const allRoutes = flatRoutes(appRouteMetaList);

    // Ưu tiên match "end: true" trước (route cụ thể nhất), sau đó mới fallback "end: false".
    const exact = allRoutes.find((r) => matchPath({ path: r.path, end: true }, pathname));
    if (exact) return exact;

    return allRoutes.find((r) => matchPath({ path: r.path, end: false }, pathname));
  }, [pathname]);

  // Hàm kiểm tra xem đường dẫn `path` truyền vào có đang là active không
  const isPathActive = (path: string): boolean => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  return {
    pathname,
    breadcrumbItems,
    currentRouteMeta,
    isPathActive,
  };
}
