import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProgramUseCase } from '../../../application/curriculum/use-cases/create-program.use-case';
import { updateProgramUseCase } from '../../../application/curriculum/use-cases/update-program.use-case';
import { queryKeys } from '../../../infrastructure/query/query-keys';
import { toastAdapter } from '../../../infrastructure/adapters/toast.adapter';
import { mapHttpError } from '../../../infrastructure/http/http-error.mapper';
import type { CreateProgramRequestDto, UpdateProgramRequestDto } from '../../../application/curriculum/dto/program.dto';

/**
 * Hook tạo mới program
 */
export const useCreateProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProgramRequestDto) => createProgramUseCase(payload),
    onSuccess: () => {
      // Invalidate danh sách programs để fetch lại data mới
      queryClient.invalidateQueries({ queryKey: queryKeys.curriculum.programs() });
      toastAdapter.success('Tạo chương trình học thành công');
    },
    onError: (error: unknown) => {
      toastAdapter.error(mapHttpError(error));
    },
  });
};

/**
 * Hook cập nhật program
 * @param programId ID chương trình cần cập nhật
 */
export const useUpdateProgram = (programId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProgramRequestDto) => {
      if (!programId) throw new Error('Program ID is required');
      return updateProgramUseCase(programId, payload);
    },
    onSuccess: () => {
      // Invalidate danh sách và detail
      queryClient.invalidateQueries({ queryKey: queryKeys.curriculum.programs() });
      if (programId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.curriculum.program(programId) });
      }
      toastAdapter.success('Cập nhật chương trình học thành công');
    },
    onError: (error: unknown) => {
      toastAdapter.error(mapHttpError(error));
    },
  });
};
