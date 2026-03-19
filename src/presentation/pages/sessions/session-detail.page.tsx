import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, MessageCircle, CalendarPlus, BookOpen } from "lucide-react";
import PageShell from "../../layouts/page-shell";
import { useSession } from "../../hooks/sessions/use-sessions";
import { useClassRoster } from "../../hooks/classes/use-classes";
import { SessionTypeBadge } from "../../components/sessions/session-type-badge";
import { CoverTeacherModal } from "../../components/sessions/cover-teacher-modal";
import { ProtectedAction } from "../../components/common/protected-action";
import { AppRoles } from "../../../shared/constants/roles";
import { RoutePaths } from "../../../app/router/route-paths";
import { Loading } from "../../../shared/ui/feedback/loading";
import { ErrorState } from "../../../shared/ui/feedback/error-state";
import { EmptyState } from "../../../shared/ui/feedback/empty";

/**
 * Trang chi tiết của một Buổi Học (Session).
 * Dùng cho cả Giáo viên xem giáo án+ds học sinh, và Academic cài người dạy thay.
 */
export const SessionDetailPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [isCoverTeacherModalOpen, setIsCoverTeacherModalOpen] = useState(false);

  // Kéo Data Chi tiết Session
  const { data: session, isLoading: sessionLoading, isError: sessionError } = useSession(sessionId);

  // Cần classId từ session để lấy roster. Khóa query để chờ cắn classId
  const { data: roster, isLoading: rosterLoading } = useClassRoster(session?.classId);

  // Xử lý loading và lỗi
  if (sessionLoading) {
    return (
      <PageShell title="Chi tiết Buổi học">
        <Loading text="Đang tải dữ liệu buổi học..." className="py-20" />
      </PageShell>
    );
  }

  if (sessionError || !session) {
    return (
      <PageShell title="Chi tiết Buổi học">
        <ErrorState
          title="Không tìm thấy buổi học"
          message="Buổi học này có thể không tồn tại hoặc bạn không có quyền truy cập."
          onRetry={() => window.location.reload()}
        />
      </PageShell>
    );
  }

  // Formatting strings
  const formattedDate = new Date(session.sessionDate).toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const lessonLabel =
    session.lessonNo !== 0 ? (session.lessonPattern ?? String(session.lessonNo)) : "";
  const courseSectionText = `Unit ${session.unitNo} ${lessonLabel ? "— Bài " + lessonLabel : ""}`;
  const teacherText = session.teacherEffectiveName || "Chưa phân công";

  return (
    <PageShell
      title={`Chi tiết: Bài ${session.lessonNo || session.unitNo} (${formattedDate})`}
      subtitle={`Lớp ID: ${session.classId}`} // Có thể query lấy class info để map name thay vì ID
      actions={
        <div className="flex gap-2">
          <button
            onClick={() => navigate(RoutePaths.CLASS_DETAIL.replace(":classId", session.classId))}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Trở về</span>
          </button>

          {/* Quy tắc: Academic/Root được gán */}
          <ProtectedAction allowedRoles={[AppRoles.ROOT, AppRoles.ACADEMIC]}>
            <button
              onClick={() => setIsCoverTeacherModalOpen(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>Gán giáo viên dạy thay</span>
            </button>
          </ProtectedAction>
        </div>
      }
    >
      <div className="flex flex-col gap-6 mt-4">
        {/* === HEADER TỔNG QUAN BÀI === */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 grid xl:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-6">
          <div className="flex bg-gray-50/50 rounded-lg p-4 border border-gray-100 gap-4">
            <div className="bg-white p-2 border border-gray-200 rounded-lg shadow-sm h-min">
              <BookOpen className="w-6 h-6 text-indigo-500" />
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase">Nội dung học</div>
              <div className="text-sm font-medium text-gray-900 mt-1">{courseSectionText}</div>
              <div className="mt-2"><SessionTypeBadge type={session.type} size="sm" /></div>
            </div>
          </div>

          <div className="flex bg-gray-50/50 rounded-lg p-4 border border-gray-100 gap-4">
            <div className="bg-white p-2 border border-blue-200 rounded-lg shadow-sm h-min">
              <User className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase">Giáo viên trực tiếp</div>
              <div className="text-sm font-medium text-gray-900 mt-1">{teacherText}</div>
              {session.teacherEffectiveId && <div className="text-xs text-indigo-600 mt-0.5 font-medium cursor-pointer">Xem hồ sơ</div>}
            </div>
          </div>
        </div>

        {/* === HAI CỘT CHÍNH === */}
        <div className="grid xl:grid-cols-5 grid-cols-1 gap-6">
          {/* CỘT 1: Danh sách roster đi học */}
          <div className="xl:col-span-3 bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden flex flex-col h-[500px]">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" /> Danh sách học viên (Roster)
              </h3>
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full border border-indigo-100">
                Sĩ số thực: {roster?.length || 0}
              </span>
            </div>
            <div className="p-0 overflow-y-auto flex-1">
              {rosterLoading ? (
                 <Loading className="py-10" />
              ) : roster?.length === 0 ? (
                 <EmptyState title="Lớp chưa có học sinh" className="py-10" />
              ) : (
                <ul className="divide-y divide-gray-100">
                  {roster?.map((student, idx) => (
                    <li key={student.studentId} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition">
                      <div className="w-6 text-xs text-gray-400 font-medium">{(idx + 1).toString().padStart(2, '0')}</div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{student.fullName}</div>
                        <div className="text-xs text-gray-500">{`Mã: ${student.studentId.slice(0, 8)}`}</div>
                      </div>
                      <div className="text-xs text-gray-400 italic">Chưa đánh giá</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* CỘT 2: Nút điều hướng đến trang Nhận xét & Điểm */}
          <div className="xl:col-span-2 bg-indigo-50/30 border border-indigo-100 rounded-xl shadow-sm p-6 flex flex-col items-center justify-center text-center">
            <div className="bg-indigo-100 p-4 rounded-full mb-4">
              <MessageCircle className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Nhận xét & Đánh giá</h3>
            <p className="text-sm text-gray-600 mb-6 max-w-sm">
              Giáo viên đứng lớp điểm danh, ghi nhận xét và nhập điểm bài kiểm tra cho từng học viên trong buổi học này.
            </p>
            {/* Nút điều hướng sang trang Feedback — chỉ active với Teacher đứng lớp hoặc Academic/Director */}
            <button
              onClick={() => navigate(RoutePaths.SESSION_FEEDBACK.replace(':sessionId', session.id))}
              className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm transition flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Vào trang Nhận xét &amp; Điểm
            </button>
          </div>
        </div>
      </div>

      {isCoverTeacherModalOpen && (
        <CoverTeacherModal 
          isOpen={isCoverTeacherModalOpen} 
          onClose={() => setIsCoverTeacherModalOpen(false)}
          sessionId={session.id}
          classId={session.classId}
          currentTeacherName={session.teacherEffectiveName}
        />
      )}
    </PageShell>
  );
};

export default SessionDetailPage;
