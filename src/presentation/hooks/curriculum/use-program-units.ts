import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../infrastructure/query/query-keys';
import { listProgramUnitsUseCase } from '../../../application/curriculum/use-cases/list-program-units.use-case';
import { getUnitUseCase, type UnitDetailsResult } from '../../../application/curriculum/use-cases/get-unit.use-case';
import type { UnitModel } from '../../../domain/curriculum/models/unit.model';

/**
 * Hook lấy danh sách units của một program
 * @param programId ID của chương trình học
 */
export const useProgramUnits = (programId?: string) => {
  return useQuery<UnitModel[], Error>({
    queryKey: queryKeys.curriculum.programUnits(programId!),
    queryFn: () => listProgramUnitsUseCase(programId!),
    enabled: !!programId,
  });
};

/**
 * Hook lấy thông tin chi tiết 1 unit (kèm lessons)
 * @param unitId ID của unit
 */
export const useUnit = (unitId?: string) => {
  return useQuery<UnitDetailsResult, Error>({
    queryKey: queryKeys.curriculum.unit(unitId!),
    queryFn: () => getUnitUseCase(unitId!),
    enabled: !!unitId,
  });
};
