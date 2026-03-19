import type { UnitModel } from '../../../domain/curriculum/models/unit.model';
import type { CreateUnitRequestDto } from '../dto/unit.dto';
import { curriculumApi } from '../../../infrastructure/services/curriculum.api';
import { mapUnitDtoToModel } from '../mappers/curriculum.mapper';

/**
 * Use-case: Tạo mới unit cho một chương trình học
 */
export const createUnitUseCase = async (programId: string, payload: CreateUnitRequestDto): Promise<UnitModel> => {
  const dto = await curriculumApi.createUnit(programId, payload);
  return mapUnitDtoToModel(dto);
};
