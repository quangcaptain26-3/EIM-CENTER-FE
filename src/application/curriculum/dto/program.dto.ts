import type { ProgramLevel } from "../../../domain/curriculum/models/program.model";

/**
 * DTO tạo mới Program
 */
export type CreateProgramRequestDto = {
  code: string;
  name: string;
  level: ProgramLevel;
  totalUnits: number;
  lessonsPerUnit: number;
  sessionsPerWeek: number;
  feePlanId?: string;
};

/**
 * DTO cập nhật Program
 */
export type UpdateProgramRequestDto = Partial<CreateProgramRequestDto>;

/**
 * DTO trả về cho Program
 */
export type ProgramResponseDto = {
  id: string;
  code: string;
  name: string;
  level: ProgramLevel;
  totalUnits: number;
  lessonsPerUnit: number;
  sessionsPerWeek: number;
  feePlanId?: string;
  createdAt: string;
};

/**
 * DTO trả về danh sách Programs
 */
export type ListProgramsResponseDto = ProgramResponseDto[];
