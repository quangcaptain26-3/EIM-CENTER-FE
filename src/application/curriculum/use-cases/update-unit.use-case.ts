import type { UnitModel } from '../../../domain/curriculum/models/unit.model';
import type { UpdateUnitRequestDto } from '../dto/unit.dto';
import { curriculumApi } from '../../../infrastructure/services/curriculum.api';
import { mapUnitDtoToModel } from '../mappers/curriculum.mapper';

/**
 * Use-case: Cập nhật thông tin unit
 */
export const updateUnitUseCase = async (unitId: string, payload: UpdateUnitRequestDto): Promise<UnitModel> => {
  const dto = await curriculumApi.updateUnit(unitId, payload);
  return mapUnitDtoToModel(dto);
};
