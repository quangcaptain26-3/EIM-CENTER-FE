import { apiClient } from '@/app/config/axios';
import type { ApiSuccessResponse } from '@/shared/types/api.type';
import type {
  ListClassesQueryDto,
  ClassResponseDto,
  CreateClassRequestDto,
  UpdateClassRequestDto,
  ClassRosterResponseDto,
  UpsertSchedulesRequestDto,
  ClassStaffResponseDto,
  AssignStaffRequestDto,
} from '@/application/classes/dto/classes.dto';

/**
 * Định dạng danh sách lớp học trả về từ API
 */
export interface ListClassesResponse {
  items: ClassResponseDto[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Các hàm tương tác với API của module Lớp học (Classes)
 * Xử lý lỗi từ axios sẽ được tự động chặn bởi interceptor cấu hình sẵn
 * của apiClient hoặc được catch ở custom hook
 */
export const classesService = {
  /**
   * Lấy danh sách lớp học, hỗ trợ phân trang và bộ lọc (search, status)
   * GET /classes
   */
  listClasses: async (params?: ListClassesQueryDto): Promise<ApiSuccessResponse<ListClassesResponse>> => {
    const response = await apiClient.get('/classes', { params });
    return response.data;
  },

  /**
   * Tạo mới lớp học
   * POST /classes
   */
  createClass: async (payload: CreateClassRequestDto): Promise<ApiSuccessResponse<ClassResponseDto>> => {
    const response = await apiClient.post('/classes', payload);
    return response.data;
  },

  /**
   * Cập nhật thông tin cơ bản của lớp học
   * PATCH /classes/:id
   */
  updateClass: async (id: string, payload: UpdateClassRequestDto): Promise<ApiSuccessResponse<ClassResponseDto>> => {
    const response = await apiClient.patch(`/classes/${id}`, payload);
    return response.data;
  },

  /**
   * Lấy chi tiết thông tin 1 lớp học
   * GET /classes/:id
   */
  getClassById: async (id: string): Promise<ApiSuccessResponse<ClassResponseDto>> => {
    const response = await apiClient.get(`/classes/${id}`);
    return response.data;
  },

  /**
   * Lấy danh sách học sinh của lớp học (Roster)
   * GET /classes/:id/roster
   */
  getClassRoster: async (id: string): Promise<ApiSuccessResponse<ClassRosterResponseDto[]>> => {
    const response = await apiClient.get(`/classes/${id}/roster`);
    return response.data;
  },

  /**
   * Cập nhật toàn bộ lịch học của lớp học (Upsert)
   * PUT /classes/:id/schedules
   */
  upsertClassSchedules: async (id: string, payload: UpsertSchedulesRequestDto): Promise<ApiSuccessResponse<void>> => {
    const response = await apiClient.put(`/classes/${id}/schedules`, payload);
    return response.data;
  },

  /**
   * Phân công giáo viên/trợ giảng cho lớp học
   * POST /classes/:id/staff
   */
  assignClassStaff: async (id: string, payload: AssignStaffRequestDto): Promise<ApiSuccessResponse<ClassStaffResponseDto>> => {
    const response = await apiClient.post(`/classes/${id}/staff`, payload);
    return response.data;
  },

  /**
   * Huỷ phân công staff của lớp học
   * DELETE /classes/:id/staff
   * @param staffId ID của staff bị huỷ
   */
  removeClassStaff: async (classId: string, staffId: string): Promise<ApiSuccessResponse<void>> => {
    const response = await apiClient.delete(`/classes/${classId}/staff`, {
      data: { staffId } // Truyền staffId body phụ thuộc Backend
    });
    return response.data;
  },
};
