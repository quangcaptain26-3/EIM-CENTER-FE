// use-login.ts
// Hook xử lý luồng đăng nhập:
// gọi use-case → cập nhật store + query cache → hiển thị toast.

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppDispatch } from '@/app/store/hooks';
import { setCredentials } from '@/infrastructure/store/auth.slice';
import { loginUseCase } from '@/application/auth/use-cases/login.use-case';
import { mapHttpError } from '@/infrastructure/http/http-error.mapper';
import { toastAdapter } from '@/infrastructure/adapters/toast.adapter';
import { queryKeys } from '@/infrastructure/query/query-keys';
import type { LoginRequestDto } from '@/application/auth/dto/login.dto';
import type { AuthStateUser } from '@/shared/types/auth.type';

export function useLogin() {
  const dispatch     = useAppDispatch();
  const queryClient  = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginRequestDto) => loginUseCase(payload),

    onSuccess: (data) => {
      // Lưu token + user vào Redux store (và storage qua reducer)
      dispatch(setCredentials({
        accessToken:  data.accessToken,
        refreshToken: data.refreshToken,
        // Ép kiểu: AuthUserModel tương thích AuthStateUser (chỉ thiếu loggedInAt)
        user: { ...data.user, loggedInAt: Date.now() } as AuthStateUser,
      }));

      // Đặt cache auth.me để tránh gọi GET /auth/me ngay sau login
      queryClient.setQueryData(queryKeys.auth.me, data.user);

      toastAdapter.success('Đăng nhập thành công!');
    },

    onError: (error: unknown) => {
      toastAdapter.error(mapHttpError(error));
    },
  });
}
