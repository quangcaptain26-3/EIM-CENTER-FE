import { apiClient } from '@/app/config/axios';
import type { 
  CreateProgramRequestDto, 
  UpdateProgramRequestDto, 
  ProgramResponseDto, 
  ListProgramsResponseDto 
} from '@/application/curriculum/dto/program.dto';
import type { 
  CreateUnitRequestDto, 
  UpdateUnitRequestDto, 
  UnitResponseDto, 
  ProgramUnitsResponseDto, 
  UnitDetailsResponseDto 
} from '@/application/curriculum/dto/unit.dto';

// Type chuẩn chung của backend trả về (giả định)
// Nếu backend trả JSON trực tiếp thì bỏ wrapper này
export type ApiSuccessResponse<T> = {
  data: T;
  message?: string;
  statusCode?: number;
};

/**
 * Service gọi API cho Curriculum (Program & Unit)
 */
export const curriculumApi = {
  // === PROGRAMS ===
  
  /** Lấy danh sách Programs */
  listPrograms: async (): Promise<ListProgramsResponseDto> => {
    const response = await apiClient.get<ApiSuccessResponse<ListProgramsResponseDto>>('/curriculum/programs');
    return response.data.data;
  },

  /** Lấy Program theo ID */
  getProgramById: async (id: string): Promise<ProgramResponseDto> => {
    const response = await apiClient.get<ApiSuccessResponse<ProgramResponseDto>>(`/curriculum/programs/${id}`);
    return response.data.data;
  },

  /** Tạo mới Program */
  createProgram: async (payload: CreateProgramRequestDto): Promise<ProgramResponseDto> => {
    const response = await apiClient.post<ApiSuccessResponse<ProgramResponseDto>>('/curriculum/programs', payload);
    return response.data.data;
  },

  /** Cập nhật Program */
  updateProgram: async (id: string, payload: UpdateProgramRequestDto): Promise<ProgramResponseDto> => {
    const response = await apiClient.patch<ApiSuccessResponse<ProgramResponseDto>>(`/curriculum/programs/${id}`, payload);
    return response.data.data;
  },

  // === UNITS ===

  /** Lấy danh sách Units của 1 Program */
  listUnitsByProgram: async (programId: string): Promise<ProgramUnitsResponseDto> => {
    const response = await apiClient.get<ApiSuccessResponse<ProgramUnitsResponseDto>>(`/curriculum/programs/${programId}/units`);
    return response.data.data;
  },

  /** Tạo mới Unit cho 1 Program */
  createUnit: async (programId: string, payload: CreateUnitRequestDto): Promise<UnitResponseDto> => {
    const response = await apiClient.post<ApiSuccessResponse<UnitResponseDto>>(`/curriculum/programs/${programId}/units`, payload);
    return response.data.data;
  },

  /** Lấy Unit detail (kèm lessons) */
  getUnitById: async (unitId: string): Promise<UnitDetailsResponseDto> => {
    const response = await apiClient.get<ApiSuccessResponse<UnitDetailsResponseDto>>(`/curriculum/units/${unitId}`);
    return response.data.data;
  },

  /** Cập nhật Unit */
  updateUnit: async (unitId: string, payload: UpdateUnitRequestDto): Promise<UnitResponseDto> => {
    const response = await apiClient.patch<ApiSuccessResponse<UnitResponseDto>>(`/curriculum/units/${unitId}`, payload);
    return response.data.data;
  },
};
