/**
 * src/presentation/hooks/feedback/use-feedback.ts
 * Nhóm các hooks lấy dữ liệu (Queries) cho module đánh giá và điểm số.
 */
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/infrastructure/query/query-keys';
import { listSessionFeedback, listStudentScores } from '@/infrastructure/services/feedback.api';
import { FeedbackMapper } from '@/application/feedback/mappers/feedback.mapper';
import type { FeedbackRowModel } from '@/domain/feedback/models/feedback.model';
import type { ScoreModel } from '@/domain/feedback/models/score.model';
import type { SessionFeedbackApiItemDto, SessionFeedbackListItemDto } from '@/application/feedback/dto/feedback.dto';

const flattenSessionFeedbackApiItem = (item: SessionFeedbackApiItemDto): SessionFeedbackListItemDto => {
  return {
    studentId: item.studentId,
    studentName: item.studentName,
    feedbackId: item.feedback?.id ?? null,
    attendance: item.feedback?.attendance ?? null,
    homework: item.feedback?.homework ?? null,
    participation: item.feedback?.participation ?? null,
    behavior: item.feedback?.behavior ?? null,
    languageUsage: item.feedback?.languageUsage ?? null,
    comment: item.feedback?.comment ?? null,
    updatedAt: item.feedback?.updatedAt ?? null,
  };
};

/**
 * Hook truy xuất toàn bộ đánh giá của một buổi học kèm danh sách học sinh (Roster)
 * Hiển thị tất cả học viên trong màn hình chấm nhận xét (Mỗi người 1 dòng).
 * 
 * @param sessionId ID của buổi học cần tra cứu
 */
export const useSessionFeedback = (
  sessionId?: string
): ReturnType<typeof useQuery<FeedbackRowModel[]>> => {
  return useQuery({
    queryKey: queryKeys.feedback.bySession(sessionId ?? ''),
    queryFn: async () => {
      const apiItems = await listSessionFeedback(sessionId as string);
      return apiItems
        .map(flattenSessionFeedbackApiItem)
        .map((flatDto) => FeedbackMapper.toFeedbackRowModel(sessionId as string, flatDto));
    },
    enabled: !!sessionId,
  });
};

/**
 * Hook truy vấn lấy lịch sử điểm số của một học viên bất kỳ.
 * Tổng hợp toàn bộ các kết quả từ Test, Midterm, Final.
 * 
 * @param studentId ID tài khoản sinh viên
 */
export const useStudentScores = (
  studentId?: string
): ReturnType<typeof useQuery<ScoreModel[]>> => {
  return useQuery({
    queryKey: queryKeys.feedback.scoresByStudent(studentId ?? ''),
    queryFn: async () => {
      const items = await listStudentScores(studentId as string);
      return items.map((item) =>
        FeedbackMapper.toScoreModel(item.sessionId, {
          studentId: item.studentId,
          studentName: '',
          scoreId: item.id,
          listening: item.listening,
          reading: item.reading,
          writing: item.writing,
          speaking: item.speaking,
          total: item.total,
          note: null,
        }),
      );
    },
    enabled: !!studentId,
  });
};
