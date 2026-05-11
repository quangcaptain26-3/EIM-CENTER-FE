// query-client.ts
// Khởi tạo TanStack Query client với cấu hình mặc định cho toàn app.
// Được dùng trong QueryProvider để cấp phát xuống toàn bộ component tree.

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Thử lại 1 lần khi query thất bại
      retry: 1,
      // Không tự refetch khi window lấy lại focus (tránh quá nhiều request)
      refetchOnWindowFocus: false,
      // Dữ liệu coi là "tươi" trong 30 giây
      staleTime: 30_000,
    },
    mutations: {
      // Mutation không tự động thử lại
      retry: 0,
    },
  },
});
