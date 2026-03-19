import type { ProgramModel } from '../../../domain/curriculum/models/program.model';
import type { CreateProgramRequestDto } from '../dto/program.dto';
import { curriculumApi } from '../../../infrastructure/services/curriculum.api';
import { mapProgramDtoToModel } from '../mappers/curriculum.mapper';

/**
 * Use-case: Tạo mới chương trình học
 * Nhận payload DTO, gọi API và trả về Domain Model.
 */
export const createProgramUseCase = async (payload: CreateProgramRequestDto): Promise<ProgramModel> => {
  const dto = await curriculumApi.createProgram(payload);
  return mapProgramDtoToModel(dto);
};
