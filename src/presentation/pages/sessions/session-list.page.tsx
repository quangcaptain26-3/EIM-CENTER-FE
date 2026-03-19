import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Filter } from "lucide-react";
import PageShell from "../../layouts/page-shell";
import { useClass } from "../../hooks/classes/use-classes";
import { useClassSessions } from "../../hooks/sessions/use-sessions";
import { SessionTimelineList } from "../../components/sessions/session-timeline-list";
import { isAssessmentSession } from "../../../domain/sessions/rules/session.rule";
import { RoutePaths } from "../../../app/router/route-paths";

/**
 * Trang danh sách các buổi học của một lớp cụ thể.
 * Được tách riêng ra từ tab trong chi tiết lớp để có không gian mở rộng hiển thị list dạng phức tạp.
 */
export const SessionListPage = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();

  const [filterType, setFilterType] = useState<"ALL" | "ASSESSMENT" | "NORMAL">("ALL");

  const { data: classData, isLoading: classLoading } = useClass(classId);
  const { data: rawSessions, isLoading: sessionsLoading } = useClassSessions(classId);

  // Lọc dữ liệu sessions theo ý muốn của user
  const filteredSessions = (rawSessions || []).filter((session) => {
    if (filterType === "ASSESSMENT") return isAssessmentSession(session.type);
    if (filterType === "NORMAL") return !isAssessmentSession(session.type);
    return true; // ALL
  });

  return (
    <PageShell
      title={`Quản lý buổi học: ${classData?.name || "..."}`}
      subtitle="Quản lý thời khóa biểu, điểm danh và phân công giáo viên."
      actions={
        <div className="flex gap-2">
          {/* Nút quay lại trang detal của Class */}
          <button
            onClick={() => navigate(RoutePaths.CLASS_DETAIL.replace(":classId", classId!))}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Quay về Lớp</span>
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-6 mt-4">
        {/* Filter bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Filter className="w-4 h-4" />
            <span>Lọc dạng:</span>
          </div>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setFilterType("ALL")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                filterType === "ALL" ? "bg-white shadow-sm text-indigo-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterType("NORMAL")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                filterType === "NORMAL" ? "bg-white shadow-sm text-indigo-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Bình thường
            </button>
            <button
              onClick={() => setFilterType("ASSESSMENT")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                filterType === "ASSESSMENT" ? "bg-white shadow-sm text-indigo-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Kiểm tra
            </button>
          </div>
        </div>

        {/* Content list */}
        <SessionTimelineList
          sessions={filteredSessions}
          isLoading={classLoading || sessionsLoading}
          onSelectSession={(sessionId) =>
            navigate(RoutePaths.SESSION_DETAIL.replace(":sessionId", sessionId))
          }
        />
      </div>
    </PageShell>
  );
};

export default SessionListPage;
