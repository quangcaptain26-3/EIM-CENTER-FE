import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, ChevronDown } from "lucide-react";
import { useQueries } from "@tanstack/react-query";
import PageShell from "../../layouts/page-shell";
import { useAuth } from "../../hooks/auth/use-auth";
import { useMySessionsAsTeacher } from "../../hooks/sessions/use-sessions";
import { SessionTimelineList } from "../../components/sessions/session-timeline-list";
import { RoutePaths } from "../../../app/router/route-paths";
import { Loading } from "../../../shared/ui/feedback/loading";
import { EmptyState } from "../../../shared/ui/feedback/empty";
import { ErrorState } from "../../../shared/ui/feedback/error-state";
import { queryKeys } from "../../../infrastructure/query/query-keys";
import { classesApi } from "../../../infrastructure/services/classes.api";
import { mapClassDetailDtoToModel } from "../../../application/classes/mappers/class.mapper";
import type { SessionModel } from "../../../domain/sessions/models/session.model";

const ALL_CLASSES = "__all__";

/**
 * Trang "Buổi học của tôi" dành riêng cho giáo viên.
 * Hiển thị danh sách các buổi học mà giáo viên được phân công giảng dạy chính hoặc dạy thay.
 * Luồng: Chọn lớp → Xem buổi học → Nhập nhận xét (nút trực tiếp).
 */
export const MySessionsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedClassId, setSelectedClassId] = useState<string>(ALL_CLASSES);

  // Gọi hook lấy danh sách buổi học của teacher hiện tại
  const { data: sessions, isLoading, isError, refetch } = useMySessionsAsTeacher(user?.id);

  // Group danh sách session theo classId, đồng thời gán tên GV khi API chưa trả
  // (Trang "Buổi học của tôi" → tất cả session đều do user hiện tại phụ trách)
  const groupedSessions = useMemo(() => {
    if (!sessions) return {};
    const teacherDisplayName = user?.fullName || "Bạn";

    return sessions.reduce<Record<string, SessionModel[]>>((acc, session) => {
      if (!acc[session.classId]) {
        acc[session.classId] = [];
      }
      acc[session.classId].push({
        ...session,
        teacherEffectiveName: session.teacherEffectiveName || teacherDisplayName,
      });
      return acc;
    }, {});
  }, [sessions, user?.fullName]);

  const classIds = useMemo(() => Object.keys(groupedSessions), [groupedSessions]);

  // Lấy tên lớp để hiển thị trong dropdown (fetch từng lớp)
  const classQueries = useQueries({
    queries: classIds.map((id) => ({
      queryKey: queryKeys.classes.detail(id),
      queryFn: async () => {
        const res = await classesApi.getClass(id);
        return mapClassDetailDtoToModel(res.data);
      },
      enabled: classIds.length > 0,
    })),
  });

  const classMap = useMemo(() => {
    const m: Record<string, { name: string; code: string }> = {};
    classQueries.forEach((q, i) => {
      if (q.data && classIds[i]) {
        m[classIds[i]] = { name: q.data.name, code: q.data.code };
      }
    });
    return m;
  }, [classQueries, classIds]);

  // Các lớp + session để hiển thị (lọc theo dropdown)
  const displayEntries = useMemo(() => {
    const entries = Object.entries(groupedSessions);
    if (selectedClassId === ALL_CLASSES) return entries;
    const cls = groupedSessions[selectedClassId];
    if (!cls) return [];
    return [[selectedClassId, cls] as const];
  }, [groupedSessions, selectedClassId]);

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
      subtitle="Danh sách các buổi học bạn được phân công đứng lớp. Chọn lớp để xem buổi học và nhập nhận xét."
    >
      <div className="flex flex-col gap-6 mt-4">
        {!hasSessions ? (
          <EmptyState 
            title="Chưa có lịch dạy" 
            description="Bạn chưa được phân công buổi học nào trong hệ thống."
            className="py-20 bg-white border border-gray-100 rounded-xl shadow-sm"
          />
        ) : (
          <>
            {/* Chọn lớp trước, sau đó hiện các buổi học của lớp đó */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <label htmlFor="class-select" className="block text-sm font-medium text-gray-700 mb-2">
                Chọn lớp
              </label>
              <div className="relative">
                <select
                  id="class-select"
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full max-w-md appearance-none pl-4 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value={ALL_CLASSES}>Tất cả các lớp</option>
                  {classIds.map((id) => {
                    const info = classMap[id];
                    const label = info ? `${info.name} (${info.code})` : `Lớp ${id.slice(0, 8)}...`;
                    return (
                      <option key={id} value={id}>
                        {label}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-8">
              {displayEntries.map(([classId, classSessions]) => {
                const classInfo = classMap[classId];
                const classLabel = classInfo ? `${classInfo.name} (${classInfo.code})` : `Mã lớp: ${classId.slice(0, 8)}...`;
                return (
                  <div key={classId} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-indigo-500" />
                        {classLabel}
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
                        onFeedbackClick={(sessionId) =>
                          navigate(RoutePaths.SESSION_FEEDBACK.replace(":sessionId", sessionId))
                        }
                        className="shadow-none border-none"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
};

export default MySessionsPage;
