import type { ProgramModel } from '../../../domain/curriculum/models/program.model';
import type { UpdateProgramRequestDto } from '../dto/program.dto';
import { curriculumApi } from '../../../infrastructure/services/curriculum.api';
import { mapProgramDtoToModel } from '../mappers/curriculum.mapper';

/**
 * Use-case: Cập nhật chương trình học
 */
export const updateProgramUseCase = async (programId: string, payload: UpdateProgramRequestDto): Promise<ProgramModel> => {
  const dto = await curriculumApi.updateProgram(programId, payload);
  return mapProgramDtoToModel(dto);
};
