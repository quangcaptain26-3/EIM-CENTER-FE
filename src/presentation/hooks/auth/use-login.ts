import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/app/store/hooks';
import { setAuth } from '@/app/store/auth.slice';
import { login } from '@/infrastructure/services/auth.api';
import { RoutePaths } from '@/app/router/route-paths';
import { mutationToastApiError } from '@/presentation/hooks/toast-api-error';
import { mapUserResponseToAuthUser } from '@/shared/lib/map-user-response';

export function useLogin() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      return login(email, password);
    },
    onSuccess: (payload) => {
      localStorage.setItem('accessToken', payload.accessToken);
      localStorage.setItem('refreshToken', payload.refreshToken);
      dispatch(setAuth(mapUserResponseToAuthUser(payload.user)));
      navigate(RoutePaths.DASHBOARD, { replace: true });
    },
    onError: mutationToastApiError,
  });
}
