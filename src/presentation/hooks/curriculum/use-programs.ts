import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../infrastructure/query/query-keys';
import { listProgramsUseCase } from '../../../application/curriculum/use-cases/list-programs.use-case';
import { getProgramUseCase } from '../../../application/curriculum/use-cases/get-program.use-case';
import type { ProgramModel } from '../../../domain/curriculum/models/program.model';

/**
 * Hook lấy danh sách tất cả programs
 */
export const usePrograms = () => {
  return useQuery<ProgramModel[], Error>({
    queryKey: queryKeys.curriculum.programs(),
    queryFn: listProgramsUseCase,
  });
};

/**
 * Hook lấy thông tin chi tiết 1 program
 * @param programId ID của chương trình học (chỉ gọi API khi có id)
 */
export const useProgram = (programId?: string) => {
  return useQuery<ProgramModel, Error>({
    queryKey: queryKeys.curriculum.program(programId!),
    queryFn: () => getProgramUseCase(programId!),
    enabled: !!programId,
  });
};
