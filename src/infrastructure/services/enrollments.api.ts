import { apiClient } from '@/app/config/axios';
import type { ApiSuccessResponse } from '@/shared/types/api.type';
import type { 
  CreateEnrollmentRequestDto, 
  UpdateEnrollmentStatusRequestDto, 
  TransferEnrollmentRequestDto,
  EnrollmentResponseDto
} from '@/application/students/dto/enrollment.dto';

/**
 * Các hàm tương tác với API của module Ghi danh (Enrollments)
 */
export const enrollmentsApi = {
  /**
   * Tạo mới một bản ghi ghi danh (thêm học viên vào lớp)
   */
  createEnrollment: async (payload: CreateEnrollmentRequestDto): Promise<ApiSuccessResponse<EnrollmentResponseDto>> => {
    const response = await apiClient.post('/enrollments', payload);
    return response.data;
  },

  /**
   * Cập nhật trạng thái ghi danh (bảo lưu, thôi học, tốt nghiệp)
   */
  updateEnrollmentStatus: async (
    enrollmentId: string, 
    payload: UpdateEnrollmentStatusRequestDto
  ): Promise<ApiSuccessResponse<EnrollmentResponseDto>> => {
    const response = await apiClient.patch(`/enrollments/${enrollmentId}/status`, payload);
    return response.data;
  },

  /**
   * Chuyển học viên sang lớp khác
   */
  transferEnrollment: async (
    enrollmentId: string, 
    payload: TransferEnrollmentRequestDto
  ): Promise<ApiSuccessResponse<EnrollmentResponseDto>> => {
    const response = await apiClient.post(`/enrollments/${enrollmentId}/transfer`, payload);
    return response.data;
  },
};
