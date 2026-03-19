import { useClassSessions } from "@/presentation/hooks/sessions";
import { SessionTimelineList } from "@/presentation/components/sessions/session-timeline-list";

export interface ClassSchedulesTabProps {
  classId: string;
}

/**
 * Tab hiển thị thống kê danh sách trạng thái của từng buổi học
 */
export const ClassSchedulesTab = ({ classId }: ClassSchedulesTabProps) => {
  // Thực tế kéo hook ở module Sessions với filter query của lớp hiện tại
  const { data: sessions, isLoading, isError } = useClassSessions(classId);

  // Fallback tạm khi lỗi (tùy vào luồng xử lý component cha có error boundary hay ko)
  if (isError) {
    return (
      <div className="py-10 text-center text-red-500 bg-red-50 rounded-lg">
        Đã có lỗi xảy ra khi tải danh sách buổi học.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Lịch các buổi học (Sessions)
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Danh sách các buổi học thực tế được tạo từ lịch cố định. Việc can thiệp dữ liệu điểm danh, đổi giáo viên sẽ được thực hiện ở Module Sessions.
          </p>
        </div>
      </div>

      <SessionTimelineList 
        sessions={sessions || []} 
        isLoading={isLoading} 
      />
    </div>
  );
};
