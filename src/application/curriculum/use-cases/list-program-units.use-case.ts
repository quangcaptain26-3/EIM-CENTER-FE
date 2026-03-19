import type { UnitModel } from '../../../domain/curriculum/models/unit.model';
import { curriculumApi } from '../../../infrastructure/services/curriculum.api';
import { mapUnitListDtoToModels } from '../mappers/curriculum.mapper';

/**
 * Use-case: Lấy danh sách units của một chương trình học
 */
export const listProgramUnitsUseCase = async (programId: string): Promise<UnitModel[]> => {
  const dtos = await curriculumApi.listUnitsByProgram(programId);
  return mapUnitListDtoToModels(dtos);
};
