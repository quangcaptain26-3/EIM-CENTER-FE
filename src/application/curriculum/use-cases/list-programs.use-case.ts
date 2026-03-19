import type { ProgramModel } from '../../../domain/curriculum/models/program.model';
import { curriculumApi } from '../../../infrastructure/services/curriculum.api';
import { mapProgramListDtoToModels } from '../mappers/curriculum.mapper';

/**
 * Use-case: Lấy danh sách chương trình học
 * Gọi API listPrograms và chuyển đối sang Domain Model array.
 */
export const listProgramsUseCase = async (): Promise<ProgramModel[]> => {
  const dtos = await curriculumApi.listPrograms();
  return mapProgramListDtoToModels(dtos);
};
