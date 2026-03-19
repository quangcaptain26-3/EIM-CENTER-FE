import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createUnitUseCase } from '../../../application/curriculum/use-cases/create-unit.use-case';
import { updateUnitUseCase } from '../../../application/curriculum/use-cases/update-unit.use-case';
import { queryKeys } from '../../../infrastructure/query/query-keys';
import { toastAdapter } from '../../../infrastructure/adapters/toast.adapter';
import { mapHttpError } from '../../../infrastructure/http/http-error.mapper';
import type { CreateUnitRequestDto, UpdateUnitRequestDto } from '../../../application/curriculum/dto/unit.dto';

/**
 * Hook tạo mới unit cho 1 program
 * @param programId ID của chương trình học
 */
export const useCreateUnit = (programId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUnitRequestDto) => {
      if (!programId) throw new Error('Program ID is required');
      return createUnitUseCase(programId, payload);
    },
    onSuccess: () => {
      if (programId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.curriculum.programUnits(programId) });
      }
      toastAdapter.success('Tạo unit thành công');
    },
    onError: (error: unknown) => {
      toastAdapter.error(mapHttpError(error));
    },
  });
};

/**
 * Hook cập nhật unit
 * @param unitId ID của unit cần sửa
 * @param programId ID của program chứa unit này (để invalidate cache danh sách unit của program đó)
 */
export const useUpdateUnit = (unitId?: string, programId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateUnitRequestDto) => {
      if (!unitId) throw new Error('Unit ID is required');
      return updateUnitUseCase(unitId, payload);
    },
    onSuccess: () => {
      if (programId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.curriculum.programUnits(programId) });
      }
      if (unitId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.curriculum.unit(unitId) });
      }
      toastAdapter.success('Cập nhật unit thành công');
    },
    onError: (error: unknown) => {
      toastAdapter.error(mapHttpError(error));
    },
  });
};
