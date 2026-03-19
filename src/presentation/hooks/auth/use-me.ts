// use-me.ts
// Hook lấy thông tin user hiện tại từ GET /auth/me.
// Chỉ chạy khi đã có access token. Kết quả lưu vào Redux store.

import { useQuery } from '@tanstack/react-query';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { setUser } from '@/infrastructure/store/auth.slice';
import { getMeUseCase } from '@/application/auth/use-cases/get-me.use-case';
import { queryKeys } from '@/infrastructure/query/query-keys';
import type { AuthStateUser } from '@/shared/types/auth.type';
import type { AppRole } from '@/shared/constants/roles';

export function useMe() {
  const dispatch    = useAppDispatch();
  const accessToken = useAppSelector((s) => s.auth.accessToken);

  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: getMeUseCase,

    // Chỉ fetch khi có token – tránh lỗi 401 trước khi đăng nhập
    enabled: !!accessToken,

    // Không tự động retry nhiều lần khi 401 (interceptor đã xử lý)
    retry: false,

    // Cập nhật Redux store khi data mới về
    select: (data) => {
      // AuthUserModel trả về roles: string[], cần ép qua AppRole[]
      const stateUser: AuthStateUser = { 
        ...data, 
        roles: data.roles as AppRole[] 
      };
      
      dispatch(setUser(stateUser));
      return data;
    },
  });
}
