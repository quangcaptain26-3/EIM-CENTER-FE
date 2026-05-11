import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createUser,
  deleteUser,
  updateSalary,
  updateUser,
} from '@/infrastructure/services/users.api';
import { QUERY_KEYS } from '@/infrastructure/query/query-keys';
import { mutationToastApiError } from '@/presentation/hooks/toast-api-error';

function useCreateUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => createUser(data),
    onSuccess: () => {
      toast.success('Đã tạo tài khoản');
      void qc.invalidateQueries({ queryKey: ['users', 'list'] });
    },
    /** Lỗi xử lý trong UserAccountForm (toast + setError) — tránh trùng với onError */
  });
}

function useUpdateUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => updateUser(id, data),
    onSuccess: (_res, { id }) => {
      toast.success('Đã cập nhật');
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.USERS.detail(id) });
      void qc.invalidateQueries({ queryKey: ['users', 'list'] });
    },
  });
}

function useUpdateSalaryMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => updateSalary(id, data),
    onSuccess: (_res, { id }) => {
      toast.success('Đã cập nhật lương');
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.USERS.detail(id) });
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.USERS.salaryLogs(id) });
      void qc.invalidateQueries({ queryKey: ['users', 'list'] });
    },
    onError: mutationToastApiError,
  });
}

function useDeleteUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      toast.success('Đã vô hiệu nhân viên');
      void qc.invalidateQueries({ queryKey: ['users', 'list'] });
    },
    onError: mutationToastApiError,
  });
}

/** Tất cả mutation user — invalidate đúng key trong từng mutation */
export function useUserMutations() {
  return {
    createUser: useCreateUserMutation(),
    updateUser: useUpdateUserMutation(),
    updateSalary: useUpdateSalaryMutation(),
    deleteUser: useDeleteUserMutation(),
  };
}

export const useCreateUser = useCreateUserMutation;
export const useUpdateUser = useUpdateUserMutation;
export const useUpdateSalary = useUpdateSalaryMutation;
export const useSoftDeleteUser = useDeleteUserMutation;
