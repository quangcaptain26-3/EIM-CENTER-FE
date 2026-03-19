/**
 * Service gọi API cho module Lớp học (Classes)
 * Chỉ chịu trách nhiệm tương tác HTTP với backend và trả về DTO thô.
 * Mapping sang Domain Model sẽ được xử lý ở tầng Application.
 */

import { apiClient } from "@/app/config/axios";
import type {
  AssignStaffRequestDto,
  ClassDetailResponseDto,
  ClassResponseDto,
  ClassRosterResponseDto,
  ClassScheduleResponseDto,
  ClassStaffResponseDto,
  ListClassesQueryDto,
  ListClassesResponseDto,
  CreateClassRequestDto,
  UpdateClassRequestDto,
  UpsertSchedulesRequestDto,
} from "@/application/classes/dto/classes.dto";
import type { ApiSuccessResponse } from "@/shared/types/api.type";

/**
 * Các hàm gọi API cho Classes, bọc theo chuẩn `ApiSuccessResponse` của backend.
 */
export const classesApi = {
  /**
   * Lấy danh sách lớp học (có phân trang và filter)
   * GET /classes
   */
  async listClasses(
    params?: ListClassesQueryDto,
  ): Promise<ApiSuccessResponse<ListClassesResponseDto>> {
    const response = await apiClient.get<
      ApiSuccessResponse<ListClassesResponseDto>
    >("/classes", { params });
    return response.data;
  },

  /**
   * Lấy chi tiết một lớp học (kèm schedules & staff)
   * GET /classes/:id
   */
  async getClass(
    classId: string,
  ): Promise<ApiSuccessResponse<ClassDetailResponseDto>> {
    const response = await apiClient.get<
      ApiSuccessResponse<ClassDetailResponseDto>
    >(`/classes/${classId}`);
    return response.data;
  },

  /**
   * Tạo lớp học mới
   * POST /classes
   */
  async createClass(
    payload: CreateClassRequestDto,
  ): Promise<ApiSuccessResponse<ClassResponseDto>> {
    const response = await apiClient.post<
      ApiSuccessResponse<ClassResponseDto>
    >("/classes", payload);
    return response.data;
  },

  /**
   * Cập nhật thông tin lớp học
   * PATCH /classes/:id
   */
  async updateClass(
    classId: string,
    payload: UpdateClassRequestDto,
  ): Promise<ApiSuccessResponse<ClassResponseDto>> {
    const response = await apiClient.patch<
      ApiSuccessResponse<ClassResponseDto>
    >(`/classes/${classId}`, payload);
    return response.data;
  },

  /**
   * Phân công staff/giáo viên cho lớp
   * POST /classes/:id/staff
   */
  async assignStaff(
    classId: string,
    payload: AssignStaffRequestDto,
  ): Promise<ApiSuccessResponse<ClassStaffResponseDto>> {
    const response = await apiClient.post<
      ApiSuccessResponse<ClassStaffResponseDto>
    >(`/classes/${classId}/staff`, payload);
    return response.data;
  },

  /**
   * Hủy phân công staff khỏi lớp
   * DELETE /classes/:id/staff
   * Backend mong đợi body: { userId, type }
   */
  async removeStaff(
    classId: string,
    payload: AssignStaffRequestDto,
  ): Promise<ApiSuccessResponse<null>> {
    const response = await apiClient.delete<ApiSuccessResponse<null>>(
      `/classes/${classId}/staff`,
      {
        data: payload,
      },
    );
    return response.data;
  },

  /**
   * Cập nhật (upsert) lịch học của lớp
   * PUT /classes/:id/schedules
   */
  async upsertSchedules(
    classId: string,
    payload: UpsertSchedulesRequestDto,
  ): Promise<ApiSuccessResponse<ClassScheduleResponseDto[]>> {
    const response = await apiClient.put<
      ApiSuccessResponse<ClassScheduleResponseDto[]>
    >(`/classes/${classId}/schedules`, payload);
    return response.data;
  },

  /**
   * Lấy roster (danh sách học viên) của lớp
   * GET /classes/:id/roster
   */
  async getRoster(
    classId: string,
  ): Promise<ApiSuccessResponse<ClassRosterResponseDto[]>> {
    const response = await apiClient.get<
      ApiSuccessResponse<ClassRosterResponseDto[]>
    >(`/classes/${classId}/roster`);
    return response.data;
  },

  /**
   * Thêm enrollment cho lớp học.
   * POST /classes/:id/enrollments
   * Body: { enrollmentId } để thêm enrollment cũ, hoặc { studentId, startDate } để tạo mới.
   * RBAC: ROOT, DIRECTOR, ACADEMIC
   */
  async addEnrollment<TPayload extends object, TResponse>(
    classId: string,
    payload: TPayload,
  ): Promise<ApiSuccessResponse<TResponse>> {
    const response = await apiClient.post<ApiSuccessResponse<TResponse>>(
      `/classes/${classId}/enrollments`,
      payload,
    );
    return response.data;
  },

  /**
   * Đóng lớp học (chuyển status sang CLOSED).
   * POST /classes/:id/close
   * RBAC: ROOT, DIRECTOR, ACADEMIC
   * Lưu ý: không tự động thay đổi enrollment, chỉ đóng lớp và ghi audit log.
   */
  async closeClass(
    classId: string,
  ): Promise<ApiSuccessResponse<ClassResponseDto>> {
    const response = await apiClient.post<
      ApiSuccessResponse<ClassResponseDto>
    >(`/classes/${classId}/close`);
    return response.data;
  },
};


