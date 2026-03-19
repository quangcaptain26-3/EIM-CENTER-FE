// invalidation.ts
// Nơi chứa các helpers giúp Clear / Invalidate cache Query Client tập trung.
// Hữu ích lúc user Logout (xoá mọi thứ bảo mật) hoặc Refresh data chung.

import { QueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';

/**
 * Xoá sạch các cục Data thuộc về cá nhân User khi log out.
 * Tránh dính dấp dữ liệu từ tài khoản cũ sang tài khoản mới đăng nhập.
 */
export const invalidateCommonQueries = (queryClient: QueryClient) => {
  // 1. Huỷ bỏ thông tin user
  queryClient.removeQueries({ queryKey: queryKeys.auth.me });
  
  // 2. Ép fetching lại / Xoá luôn các mảng khoá khác (nếu cần thiết xoá)
  queryClient.removeQueries({ queryKey: queryKeys.students.all });
  queryClient.removeQueries({ queryKey: queryKeys.finance.all });
  queryClient.removeQueries({ queryKey: queryKeys.classes.all });

  // Hoặc an toàn nhất khi Logout là xoá TRẮNG MỌI THỨ
  // queryClient.clear();
};

/**
 * Helper invalidate cụm query liên đới tới một học viên
 */
export const invalidateStudentQueries = (queryClient: QueryClient, studentId: string) => {
  queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.students.detail(studentId) });
  queryClient.invalidateQueries({ queryKey: queryKeys.students.enrollments(studentId) });
};
