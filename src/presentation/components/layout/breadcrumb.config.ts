/**
 * src/presentation/components/layout/breadcrumb.config.ts
 * Cấu hình logic lấy thông tin breadcrumb từ hướng đường dẫn hiện tại.
 */
import type { AppRouteMeta } from '@/app/router/route-meta';
import { appRouteMetaList } from '@/app/router/route-meta';

/**
 * Lấy danh sách item cho Breadcrumb dựa trên URL pathname đang kích hoạt.
 * Lưu ý: Nó lọc qua route config cha -> con bằng toán tử startsWith().
 * @param pathname Đường dẫn hiện tại trên trình duyệt (ví dụ: "/curriculum/programs")
 * @returns Mảng đối tượng chứa label và path của các node cấp breadcrumb
 */
export function getBreadcrumbItems(pathname: string): Array<{ label: string; path?: string }> {
  // TODO: Xử lý match chính xác các params API route động có chứa ID, ví dụ /students/:id
  // Hiện tại sử dụng matching đơn giản các route phân mảnh (starts with).

  const breadcrumbItems: Array<{ label: string; path?: string }> = [];

  // Hàm đệ quy tìm path gần đúng nhất (hoặc trùng khớp) sâu theo cây
  const findPath = (routes: AppRouteMeta[], currentPathName: string) => {
     for (const route of routes) {
        // Chuyển các param động (VD: :id, :programId) thành pattern bắt 1 segment.
        // Đồng thời capture toàn bộ phần prefix match để tạo href "thực" (không còn :param).
        const routeRegexStr = route.path.replace(/:[a-zA-Z0-9_]+/g, '[^/]+');
        const regex = new RegExp(`^(${routeRegexStr})(/|$)`);

        const isMatch = route.path === '/' ? currentPathName === '/' : regex.test(currentPathName);
            
        if (isMatch) {
            // Check nếu router được phép show out
            if (route.showInBreadcrumb !== false) {
                const match = route.path === '/' ? null : regex.exec(currentPathName);
                const concretePath = route.path === '/'
                  ? route.path
                  : (match?.[1] ?? route.path);

                breadcrumbItems.push({
                   label: route.label,
                   // Dùng concretePath để click breadcrumb điều hướng được (không bị /students/:id)
                   path: concretePath
                });
            }
            
            // Tìm con nếu có
            if (route.children) {
                findPath(route.children, currentPathName);
            }
            // Vì pathname chạy tuyến tính, break tránh các module cùng nhánh match trùng
            break; 
        } else if (route.children) {
            // Tìm kiếm trong con ngay cả khi cha không khớp (hỗ trợ route không lồng nhau về path nhưng lồng trong metadata)
            findPath(route.children, currentPathName);
            if (breadcrumbItems.length > 0) break;
        }
     }
  };

  // Kéo đường duyệt lần 1
  findPath(appRouteMetaList, pathname);

  return breadcrumbItems;
}
