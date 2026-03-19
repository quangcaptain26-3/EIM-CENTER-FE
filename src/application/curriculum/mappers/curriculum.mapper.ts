import type { ProgramModel } from "../../../domain/curriculum/models/program.model";
import type { UnitModel } from "../../../domain/curriculum/models/unit.model";
import type { UnitLessonModel } from "../../../domain/curriculum/models/lesson.model";
import type { ProgramResponseDto } from "../dto/program.dto";
import type { UnitLessonResponseDto, UnitResponseDto, UnitDetailsResponseDto } from "../dto/unit.dto";

/**
 * Chuyển đổi từ DTO sang Model cho Program
 */
export const mapProgramDtoToModel = (dto: ProgramResponseDto): ProgramModel => {
  return {
    id: dto.id,
    code: dto.code,
    name: dto.name,
    level: dto.level,
    totalUnits: dto.totalUnits,
    lessonsPerUnit: dto.lessonsPerUnit,
    sessionsPerWeek: dto.sessionsPerWeek,
    feePlanId: dto.feePlanId,
    createdAt: dto.createdAt,
  };
};

/**
 * Chuyển đổi danh sách DTO sang Models cho Program
 */
export const mapProgramListDtoToModels = (dtos: ProgramResponseDto[]): ProgramModel[] => {
  return dtos.map(mapProgramDtoToModel);
};

/**
 * Chuyển đổi từ DTO sang Model cho Unit
 */
export const mapUnitDtoToModel = (dto: UnitResponseDto): UnitModel => {
  return {
    id: dto.id,
    programId: dto.programId,
    unitNo: dto.unitNo,
    title: dto.title,
    totalLessons: dto.totalLessons,
    createdAt: dto.createdAt,
  };
};

/**
 * Chuyển đổi danh sách DTO sang Models cho Unit
 */
export const mapUnitListDtoToModels = (dtos: UnitResponseDto[]): UnitModel[] => {
  return dtos.map(mapUnitDtoToModel);
};

/**
 * Chuyển đổi từ DTO sang Model cho Lesson
 */
export const mapLessonDtoToModel = (dto: UnitLessonResponseDto): UnitLessonModel => {
  return {
    id: dto.id,
    unitId: dto.unitId,
    lessonNo: dto.lessonNo,
    title: dto.title,
    sessionPattern: dto.sessionPattern,
    createdAt: dto.createdAt,
  };
};

/**
 * Chuyển đổi từ DTO chi tiết Unit sang cấu trúc Model { unit, lessons }
 */
export const mapUnitDetailsDto = (
  dto: UnitDetailsResponseDto
): { unit: UnitModel; lessons: UnitLessonModel[] } => {
  return {
    unit: mapUnitDtoToModel(dto),
    lessons: dto.lessons.map(mapLessonDtoToModel),
  };
};
