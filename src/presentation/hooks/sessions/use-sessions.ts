import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/infrastructure/query/query-keys";
import { SessionsApiService } from "@/infrastructure/services/sessions.api";
import { SessionMapper } from "@/application/sessions/mappers/sessions.mapper";
import type { ListSessionsParams } from "@/application/sessions/dto/sessions.dto";
import type { SessionModel } from "@/domain/sessions/models/session.model";

/**
 * Hook lấy danh sách tất cả các buổi học của một lớp.
 * Sắp xếp mặc định theo ngày học tăng dần (sessionDate ASC).
 * @param classId ID của lớp học
 * @param params Các thông số lọc bổ sung
 */
export const useClassSessions = (
  classId?: string,
  params?: ListSessionsParams,
): ReturnType<typeof useQuery<SessionModel[]>> => {
  return useQuery({
    queryKey: queryKeys.sessions.byClass(classId ?? ""),
    queryFn: async () => {
      const result = await SessionsApiService.listClassSessions(classId as string, params);
      
      // Chuyển đổi API Response (DTO) sang Domain Model
      const models = SessionMapper.toModelList(result.data);
      
      // Sắp xếp các buổi học theo thời gian tăng dần để đảm bảo đúng luồng giảng dạy
      return models.sort(
        (a, b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime()
      );
    },
    enabled: !!classId,
    placeholderData: keepPreviousData,
  });
};

/**
 * Hook lấy chi tiết của thông tin một buổi học.
 * @param sessionId ID của buổi học
 */
export const useSession = (
  sessionId?: string,
): ReturnType<typeof useQuery<SessionModel>> => {
  return useQuery({
    queryKey: queryKeys.sessions.detail(sessionId ?? ""),
    queryFn: async () => {
      const result = await SessionsApiService.getSession(sessionId as string);
      return SessionMapper.toModel(result.data);
    },
    enabled: !!sessionId,
  });
};

/**
 * Hook truy vấn lấy danh sách các buổi học mà giáo viên được phân công đứng lớp thực tế.
 * (teacherEffectiveId bằng teacherId hiện tại).
 * Hỗ trợ cho trang "My Sessions" / Lịch dạy cá nhân.
 * @param teacherId ID của giáo viên
 */
export const useMySessionsAsTeacher = (
  teacherId?: string,
): ReturnType<typeof useQuery<SessionModel[]>> => {
  return useQuery({
    queryKey: queryKeys.sessions.mySessionsByTeacher(teacherId ?? ""),
    queryFn: async () => {
      const result = await SessionsApiService.listTeacherSessions(teacherId as string);
      
      // Chuyển đổi API Response (DTO) sang Domain Model
      const models = SessionMapper.toModelList(result.data);
      
      // Sắp xếp theo ngày học giảm dần (mới nhất lên đầu) hoặc tùy UI yêu cầu
      // Ở đây trang My Sessions thường hiển thị timeline, nên có thể để mặc định sorting từ repo
      return models;
    },
    enabled: !!teacherId,
  });
};
