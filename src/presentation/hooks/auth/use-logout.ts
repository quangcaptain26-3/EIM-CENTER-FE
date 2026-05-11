import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/app/store/hooks';
import { clearAuth } from '@/app/store/auth.slice';
import { logout as logoutRequest } from '@/infrastructure/services/auth.api';
import { RoutePaths } from '@/app/router/route-paths';
import { mutationToastApiError } from '@/presentation/hooks/toast-api-error';

/**
 * POST /auth/logout — onSettled luôn clearAuth + navigate /login (kể cả API lỗi).
 */
export function useLogout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await logoutRequest(refreshToken);
      }
    },
    onError: mutationToastApiError,
    onSettled: () => {
      dispatch(clearAuth());
      void qc.clear();
      navigate(RoutePaths.LOGIN, { replace: true });
    },
  });
}
