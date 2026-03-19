import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar } from "lucide-react";
import PageShell from "../../layouts/page-shell";
import { useAuth } from "../../hooks/auth/use-auth";
import { useMySessionsAsTeacher } from "../../hooks/sessions/use-sessions";
import { SessionTimelineList } from "../../components/sessions/session-timeline-list";
import { RoutePaths } from "../../../app/router/route-paths";
import { Loading } from "../../../shared/ui/feedback/loading";
import { EmptyState } from "../../../shared/ui/feedback/empty";
import { ErrorState } from "../../../shared/ui/feedback/error-state";
import type { SessionModel } from "../../../domain/sessions/models/session.model";

/**
 * Trang "Buổi học của tôi" dành riêng cho giáo viên.
 * Hiển thị danh sách các buổi học mà giáo viên được phân công giảng dạy chính hoặc dạy thay.
 */
export const MySessionsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Gọi hook lầy danh sách buổi học của teacher hiện tại
  const { data: sessions, isLoading, isError, refetch } = useMySessionsAsTeacher(user?.id);

  // Group danh sách session theo classId
  const groupedSessions = useMemo(() => {
    if (!sessions) return {};
    
    return sessions.reduce<Record<string, SessionModel[]>>((acc, session) => {
      if (!acc[session.classId]) {
        acc[session.classId] = [];
      }
      acc[session.classId].push(session);
      return acc;
    }, {});
  }, [sessions]);

  if (isLoading) {
    return (
      <PageShell title="Buổi học của tôi">
        <Loading text="Đang tải lịch dạy của bạn..." className="py-20" />
      </PageShell>
    );
  }

  if (isError) {
    return (
      <PageShell title="Buổi học của tôi">
        <ErrorState 
          title="Không thể tải lịch dạy" 
          message="Đã có lỗi xảy ra khi lấy dữ liệu các buổi học của bạn."
          onRetry={() => refetch()}
        />
      </PageShell>
    );
  }

  const hasSessions = sessions && sessions.length > 0;

  return (
    <PageShell
      title="Buổi học của tôi"
      subtitle="Danh sách các buổi học bạn được phân công đứng lớp."
    >
      <div className="flex flex-col gap-6 mt-4">
        {!hasSessions ? (
          <EmptyState 
            title="Chưa có lịch dạy" 
            description="Bạn chưa được phân công buổi học nào trong hệ thống."
            className="py-20 bg-white border border-gray-100 rounded-xl shadow-sm"
          />
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedSessions).map(([classId, classSessions]) => (
              <div key={classId} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-500" />
                    Mã Lớp: {classId} {/* Trong thực tế cần map sang class name nếu có */}
                  </h3>
                  <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                    {classSessions.length} buổi
                  </span>
                </div>
                <div className="p-4">
                  <SessionTimelineList
                    sessions={classSessions}
                    onSelectSession={(sessionId) => 
                      navigate(RoutePaths.SESSION_DETAIL.replace(":sessionId", sessionId))
                    }
                    className="shadow-none border-none"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default MySessionsPage;
