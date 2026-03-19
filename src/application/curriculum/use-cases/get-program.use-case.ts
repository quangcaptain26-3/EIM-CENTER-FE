import type { ProgramModel } from '../../../domain/curriculum/models/program.model';
import { curriculumApi } from '../../../infrastructure/services/curriculum.api';
import { mapProgramDtoToModel } from '../mappers/curriculum.mapper';

/**
 * Use-case: Lấy thông tin chi tiết của 1 chương trình học theo ID
 */
export const getProgramUseCase = async (programId: string): Promise<ProgramModel> => {
  const dto = await curriculumApi.getProgramById(programId);
  return mapProgramDtoToModel(dto);
};
