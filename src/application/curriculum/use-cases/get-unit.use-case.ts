import type { UnitModel } from '../../../domain/curriculum/models/unit.model';
import type { UnitLessonModel } from '../../../domain/curriculum/models/lesson.model';
import { curriculumApi } from '../../../infrastructure/services/curriculum.api';
import { mapUnitDetailsDto } from '../mappers/curriculum.mapper';

export type UnitDetailsResult = {
  unit: UnitModel;
  lessons: UnitLessonModel[];
};

/**
 * Use-case: Lấy thông tin chi tiết của 1 unit (bao gồm danh sách lesson)
 */
export const getUnitUseCase = async (unitId: string): Promise<UnitDetailsResult> => {
  const dto = await curriculumApi.getUnitById(unitId);
  return mapUnitDetailsDto(dto);
};
