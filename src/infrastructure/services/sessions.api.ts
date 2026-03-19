/**
 * src/infrastructure/services/sessions.api.ts
 * Lớp giao tiếp gọi các kết nối HTTP cho module buổi học
 */

import { apiClient } from "@/app/config/axios";
import type { ApiSuccessResponse } from "@/shared/types/api.type";
import type {
  ListSessionsParams,
  SessionDetailDto,
  UpdateSessionDto,
  GenerateSessionsDto,
} from "@/application/sessions/dto/sessions.dto";

/**
 * Đối tượng xử lý trực tiếp giao tiếp gọi API REST Backend của Module Buổi Học
 */
export const SessionsApiService = {
  /**
   * Tính năng sinh hàng loạt buổi học (Generate Sessions)
   * POST /api/v1/classes/:id/sessions/generate
   * @param classId Định danh của lớp học cần sinh
   * @param payload Payload của tham số yêu cầu ngày khai giảng và số bài
   * @returns Danh sách các buổi học vừa được sinh thành công
   */
  async generateSessions(
    classId: string,
    payload: GenerateSessionsDto
  ): Promise<ApiSuccessResponse<SessionDetailDto[]>> {
    const response = await apiClient.post<ApiSuccessResponse<SessionDetailDto[]>>(
      `/classes/${classId}/sessions/generate`,
      payload
    );
    return response.data;
  },

  /**
   * Lấy danh sách toàn bộ các buổi học đang có của một lớp
   * GET /api/v1/classes/:id/sessions
   * @param classId Định danh lớp học
   * @param params Bộ lọc thông số (nếu có)
   * @returns Mảng chi tiết DTO của các buổi học thuộc lớp
   */
  async listClassSessions(
    classId: string,
    params?: ListSessionsParams
  ): Promise<ApiSuccessResponse<SessionDetailDto[]>> {
    const response = await apiClient.get<ApiSuccessResponse<SessionDetailDto[]>>(
      `/classes/${classId}/sessions`,
      { params }
    );
    return response.data;
  },

  /**
   * Lấy chi tiết thông tin cụ thể (chưa ánh xạ) của 1 buổi học
   * GET /api/v1/sessions/:sessionId
   * @param sessionId Định danh của buổi học
   * @returns DTO chi tiết buổi học trực tiếp
   */
  async getSession(sessionId: string): Promise<ApiSuccessResponse<SessionDetailDto>> {
    const response = await apiClient.get<ApiSuccessResponse<SessionDetailDto>>(
      `/sessions/${sessionId}`
    );
    return response.data;
  },

  /**
   * Thay đổi thông tin 1 buổi học (gắn ghi chú, đổi gv, đổi ngày)
   * PATCH /api/v1/sessions/:sessionId
   * @param sessionId ID xác định buổi học để thay đổi
   * @param payload Dữ liệu payload muốn update (UpdateSessionDto)
   * @returns DTO sau khi update từ API
   */
  async updateSession(
    sessionId: string,
    payload: UpdateSessionDto
  ): Promise<ApiSuccessResponse<SessionDetailDto>> {
    const response = await apiClient.patch<ApiSuccessResponse<SessionDetailDto>>(
      `/sessions/${sessionId}`,
      payload
    );
    return response.data;
  },

  /**
   * Helper function gắn riêng giáo viên dạy thay (Cover teacher)
   * Hoạt động bằng cách bọc phương thức updateSession theo nghiệp vụ.
   * @param sessionId ID xác định buổi học
   * @param coverTeacherId ID giáo viên dạy thay (hoặc null nếu muốn gỡ)
   * @returns Kết quả update sau cùng
   */
  async setSessionCoverTeacher(
    sessionId: string,
    coverTeacherId: string | null
  ): Promise<ApiSuccessResponse<SessionDetailDto>> {
    return this.updateSession(sessionId, { coverTeacherId });
  },

  /**
   * Lấy danh sách buổi học của một giáo viên (Lịch dạy cá nhân)
   * GET /api/v1/sessions/teacher/:teacherId
   * @param teacherId ID của giáo viên
   * @returns Danh sách các buổi học của giáo viên đó
   */
  async listTeacherSessions(
    teacherId: string
  ): Promise<ApiSuccessResponse<SessionDetailDto[]>> {
    const response = await apiClient.get<ApiSuccessResponse<SessionDetailDto[]>>(
      `/sessions/teacher/${teacherId}`
    );
    return response.data;
  },
};
