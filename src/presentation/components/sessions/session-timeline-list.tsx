import { Calendar, User, BookOpen } from "lucide-react";
import type { SessionModel } from "@/domain/sessions/models/session.model";
import { isAssessmentSession } from "@/domain/sessions/rules/session.rule";
import { SessionTypeBadge } from "./session-type-badge";
import { EmptyState } from "@/shared/ui/feedback/empty";
import { cn } from "@/shared/lib/cn";

export interface SessionTimelineListProps {
  /**
   * Danh sách các buổi học cần hiển thị
   */
  sessions: SessionModel[];
  /**
   * Cờ trạng thái loading dữ liệu nếu được gọi từ react-query
   */
  isLoading?: boolean;
  /**
   * Móc callback khi nhấn vào xem chi tiết của 1 phiên học (tùy chọn)
   */
  onSelectSession?: (sessionId: string) => void;
  /**
   * Css tùy chọn mở rộng cho bao bì khối element
   */
  className?: string;
}

/**
 * Component hiển thị danh sách khóa học thành dạng mảng dạng dòng (Row/Timeline)
 * Theo đúng định dạng sắp xếp từ cũ tới mới.
 */
export const SessionTimelineList = ({
  sessions,
  isLoading = false,
  onSelectSession,
  className,
}: SessionTimelineListProps) => {
  if (isLoading) {
    return (
      <div className={cn("py-10 text-center text-gray-500", className)}>
        Đang tải lịch buổi học...
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <EmptyState
        title="Chưa có buổi học nào"
        description="Lớp học này chưa được khởi tạo lịch các buổi học (sessions)."
        className={cn("bg-gray-50 border border-gray-100 rounded-xl", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "w-full overflow-x-auto rounded-lg shadow-sm border border-gray-200",
        className
      )}
    >
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 w-48">Ngày học</th>
            <th className="px-6 py-3">Nội dung (Unit/Lesson)</th>
            <th className="px-6 py-3 text-center">Loại hình</th>
            <th className="px-6 py-3 text-right">Giáo viên phụ trách</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-gray-600 bg-white">
          {sessions.map((session, index) => {
            // Hiển thị highlight mờ nếu là các buối assessment (kiểm tra)
            const isHighlight = isAssessmentSession(session.type);
            const teacherName = session.teacherEffectiveName || "Chưa phân công";
            // Check nếu teacherEffectiveId mà ko null nhưng name null => có thể user chưa map tên (thường đc map ở tầng logic service)

            return (
              <tr
                key={session.id}
                onClick={() => onSelectSession?.(session.id)}
                className={cn(
                  "transition-colors",
                  onSelectSession ? "cursor-pointer" : "",
                  isHighlight ? "bg-orange-50/40 hover:bg-orange-50/80" : "hover:bg-gray-50"
                )}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 font-medium text-gray-900">
                    <span className="text-gray-400 text-xs w-6 inline-block">
                      #{index + 1}
                    </span>
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    {new Date(session.sessionDate).toLocaleDateString("vi-VN")}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-gray-400" />
                    {/* Kết hợp Unit và lessonNo. Lesson 0 theo backend mô tả đánh dấu là Test/Quiz special logic */}
                    Unit {session.unitNo}{" "}
                    {session.lessonNo !== 0
                      ? `— Bài ${session.lessonPattern ?? String(session.lessonNo)}`
                      : ""}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <SessionTypeBadge type={session.type} />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end items-center gap-2 text-gray-700">
                    <User className="w-4 h-4 text-gray-400" />
                    <span
                      className={cn(
                        !session.teacherEffectiveName && !session.teacherEffectiveId
                          ? "text-gray-400 italic"
                          : ""
                      )}
                    >
                      {teacherName}
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
