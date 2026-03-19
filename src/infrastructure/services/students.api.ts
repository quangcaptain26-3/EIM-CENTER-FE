import { apiClient } from '@/app/config/axios';
import type { ApiSuccessResponse } from '@/shared/types/api.type';
import type { 
  StudentResponseDto, 
  CreateStudentRequestDto, 
  UpdateStudentRequestDto, 
  ListStudentsQueryDto,
  ExportStudentsParams,
} from '@/application/students/dto/student.dto';
import type { EnrollmentResponseDto } from '@/application/students/dto/enrollment.dto';
import { downloadExcelFromApi } from '@/shared/lib/excel';

/**
 * Định dạng danh sách học viên trả về (dựa theo yêu cầu FE-4B)
 */
export type ListStudentsResponse = {
  items: StudentResponseDto[];
  total: number;
  limit: number;
  offset: number;
};

/**
 * Các hàm tương tác với API của module Học viên (Students)
 */
export const studentsApi = {
  /**
   * Lấy danh sách học viên (có phân trang, tìm kiếm)
   */
  listStudents: async (params?: ListStudentsQueryDto): Promise<ApiSuccessResponse<ListStudentsResponse>> => {
    const response = await apiClient.get('/students', { params });
    return response.data;
  },

  /**
   * Tạo mới học viên
   */
  createStudent: async (payload: CreateStudentRequestDto): Promise<ApiSuccessResponse<StudentResponseDto>> => {
    const response = await apiClient.post('/students', payload);
    return response.data;
  },

  /**
   * Lấy chi tiết thông tin 1 học viên
   */
  getStudentById: async (id: string): Promise<ApiSuccessResponse<StudentResponseDto>> => {
    const response = await apiClient.get(`/students/${id}`);
    return response.data;
  },

  /**
   * Cập nhật thông tin học viên
   */
  updateStudent: async (id: string, payload: UpdateStudentRequestDto): Promise<ApiSuccessResponse<StudentResponseDto>> => {
    const response = await apiClient.patch(`/students/${id}`, payload);
    return response.data;
  },

  /**
   * Lấy danh sách các lớp ghi danh của 1 học viên
   */
  listStudentEnrollments: async (studentId: string): Promise<ApiSuccessResponse<EnrollmentResponseDto[]>> => {
    const response = await apiClient.get(`/students/${studentId}/enrollments`);
    return response.data;
  },

  /**
   * Xuất danh sách học viên ra Excel
   * GET /api/v1/students/export
   */
  exportStudentsExcel: async (params?: ExportStudentsParams): Promise<void> => {
    await downloadExcelFromApi('/students/export', params ?? {}, 'students.xlsx');
  },
};
