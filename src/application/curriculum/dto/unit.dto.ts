import type { SessionPattern } from "../../../domain/curriculum/models/lesson.model";

/**
 * DTO tạo mới Unit
 */
export type CreateUnitRequestDto = {
  unitNo: number;
  title: string;
  totalLessons?: number;
};

/**
 * DTO cập nhật Unit
 */
export type UpdateUnitRequestDto = Partial<CreateUnitRequestDto>;

/**
 * DTO trả về cho Unit
 */
export type UnitResponseDto = {
  id: string;
  programId: string;
  unitNo: number;
  title: string;
  totalLessons: number;
  createdAt: string;
};

/**
 * DTO trả về cho UnitLesson
 */
export type UnitLessonResponseDto = {
  id: string;
  unitId: string;
  lessonNo: number;
  title: string;
  sessionPattern: SessionPattern;
  createdAt: string;
};

/**
 * DTO trả về danh sách Units của Program
 */
export type ProgramUnitsResponseDto = UnitResponseDto[];

/**
 * DTO trả về chi tiết Unit kèm danh sách Lessons
 */
export type UnitDetailsResponseDto = UnitResponseDto & {
  lessons: UnitLessonResponseDto[];
};
