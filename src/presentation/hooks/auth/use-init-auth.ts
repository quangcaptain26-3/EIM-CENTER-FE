import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppDispatch } from '@/app/store/hooks';
import { clearAuth, setAuth, setInitialized } from '@/app/store/auth.slice';
import { getMe } from '@/infrastructure/services/auth.api';
import { QUERY_KEYS } from '@/infrastructure/query/query-keys';
import { mapUserResponseToAuthUser } from '@/shared/lib/map-user-response';

/**
 * App mount: GET /auth/me khi có accessToken; cập nhật Redux.
 */
export function useInitAuth() {
  const dispatch = useAppDispatch();
  const hasToken = Boolean(typeof window !== 'undefined' && localStorage.getItem('accessToken'));

  const q = useQuery({
    queryKey: QUERY_KEYS.AUTH.me,
    queryFn: () => getMe(),
    enabled: hasToken,
    retry: false,
    staleTime: 0,
  });

  useEffect(() => {
    if (!hasToken) {
      dispatch(setInitialized(true));
    }
  }, [hasToken, dispatch]);

  useEffect(() => {
    if (!hasToken) return;
    if (q.isPending) return;
    if (q.isSuccess && q.data) {
      dispatch(setAuth(mapUserResponseToAuthUser(q.data)));
    }
    if (q.isError) {
      dispatch(clearAuth());
    }
    dispatch(setInitialized(true));
  }, [hasToken, q.isPending, q.isSuccess, q.isError, q.data, dispatch]);
}
