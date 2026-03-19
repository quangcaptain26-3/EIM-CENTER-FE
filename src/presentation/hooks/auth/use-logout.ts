// use-logout.ts
// Hook xử lý luồng đăng xuất:
// gọi use-case → clear store + query cache → navigate về /login.

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { clearAuth } from '@/infrastructure/store/auth.slice';
import { logoutUseCase } from '@/application/auth/use-cases/logout.use-case';
import { invalidateCommonQueries } from '@/infrastructure/query/invalidation';
import { toastAdapter } from '@/infrastructure/adapters/toast.adapter';
import { RoutePaths } from '@/app/router/route-paths';

export function useLogout() {
  const dispatch     = useAppDispatch();
  const queryClient  = useQueryClient();
  const navigate     = useNavigate();
  const refreshToken = useAppSelector((s) => s.auth.refreshToken);

  return useMutation({
    mutationFn: async () => {
      // Chỉ gọi API logout nếu có refreshToken để BE thu hồi
      if (refreshToken) {
        await logoutUseCase({ refreshToken });
      }
    },

    onSettled: () => {
      // Dù API thành công hay thất bại đều phải clear local auth
      dispatch(clearAuth());

      // Xoá cache query của user (auth.me, students, finance, …)
      invalidateCommonQueries(queryClient);

      // Chuyển về trang login
      navigate(RoutePaths.LOGIN, { replace: true });

      toastAdapter.info('Đã đăng xuất.');
    },
  });
}
