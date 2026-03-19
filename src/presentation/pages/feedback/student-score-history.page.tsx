/**
 * src/presentation/pages/feedback/student-score-history.page.tsx
 * Màn hình cho phép Quản lý Trung tâm theo dõi toàn cảnh Biểu đồ (Thành tích Điểm số) 
 * lịch sử của một Học viên cụ thể xuyên suốt các Session kiểm tra.
 */
import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, GraduationCap, Target } from 'lucide-react';

import { PageShell } from '@/presentation/components/common/page-shell';
import { useStudentScores } from '@/presentation/hooks/feedback/use-feedback';
import { RoutePaths } from '@/app/router/route-paths';
import { Loading } from '@/shared/ui/feedback/loading';
import { ErrorState } from '@/shared/ui/feedback/error-state';
import { EmptyState } from '@/shared/ui/feedback/empty';
import { Badge } from '@/shared/ui/badge';

export const StudentScoreHistoryPage = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();

  const { data: scores, isLoading, isError } = useStudentScores(studentId);

  // Tính điểm trung bình một cách nhanh chóng ngay tại Component
  const averages = useMemo(() => {
    if (!scores || scores.length === 0) return { total: 0, validCount: 0, avg: 0 };
    
    // Lấy những bài chấm điểm đã có giá trị
    const validScores = scores.filter(s => s.total !== null && s.total !== undefined);
    const validCount = validScores.length;

    if (validCount === 0) return { total: 0, validCount: 0, avg: 0 };

    const total = validScores.reduce((sum, s) => sum + (s.total as number), 0);
    const avg = parseFloat((total / validCount).toFixed(1));
    return { total, validCount, avg };

  }, [scores]);

  if (isLoading) {
    return (
      <PageShell title="Bảng thành tích Học viên">
        <Loading text="Đang thống kê dữ liệu điểm số..." className="py-20" />
      </PageShell>
    );
  }

  if (isError) {
    return (
      <PageShell title="Bảng thành tích Học viên">
        <ErrorState
          title="Không tìm thấy Dữ liệu Điểm"
          message="Đường dẫn hoặc hệ thống đang xảy ra lỗi khi tìm Học viên."
          onRetry={() => window.location.reload()}
        />
      </PageShell>
    );
  }

  // Tên tạm thời (Nên query thêm Endpoint getStudentById nếu thực tế có)
  const studentNameDisplay = scores && scores.length > 0 ? scores[0].studentName : `ID: ${studentId?.slice(0, 8)}`;

  return (
    <PageShell
      title={`Hồ sơ Học lực: ${studentNameDisplay}`}
      description="Lưu vết lại toàn bộ điểm kiểm tra định kỳ và đánh giá của sinh viên."
      actions={
        <div className="flex gap-2">
          <button
            // Nhảy tới trang Hồ sơ chung quy của em đó (Tương lai ghép chung tab cũng hợp lý)
            onClick={() => navigate(RoutePaths.STUDENT_DETAIL.replace(':id', studentId as string))}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Hồ sơ chung</span>
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-6 mt-4">
        
        {/* === THỐNG KÊ NHANH (SUMMARY WIDGETS) === */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-5">
            <div className="bg-indigo-50 p-4 rounded-full text-indigo-600">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-500 uppercase">Điểm trung bình</div>
              <div className="text-3xl font-bold text-gray-900 mt-1">{averages.avg > 0 ? averages.avg : '--'}</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-5">
            <div className="bg-blue-50 p-4 rounded-full text-blue-600">
              <Target className="w-8 h-8" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-500 uppercase">Tổng số bài hoàn thành</div>
              <div className="text-3xl font-bold text-gray-900 mt-1">{averages.validCount} <span className="text-base font-normal text-gray-500">/{scores?.length || 0}</span></div>
            </div>
          </div>
        </div>

        {/* === BẢNG CHI TIẾT TỪNG BÀI KIỂM TRA === */}
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50/50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Chi tiết theo Buổi học</h3>
            <Badge variant="info">Tổng {scores?.length || 0} lượt</Badge>
          </div>

          {(!scores || scores.length === 0) ? (
            <EmptyState title="Học viên này rất mới" description="Chưa có dữ liệu bài test nào được cập nhật trên hệ thống." className="py-16" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 font-semibold text-gray-500">Session</th>
                    <th className="px-4 py-3 font-semibold text-gray-500 text-center">L</th>
                    <th className="px-4 py-3 font-semibold text-gray-500 text-center">R</th>
                    <th className="px-4 py-3 font-semibold text-gray-500 text-center">W</th>
                    <th className="px-4 py-3 font-semibold text-gray-500 text-center">S</th>
                    <th className="px-6 py-3 font-semibold text-gray-500">Trung bình</th>
                    <th className="px-6 py-3 font-semibold text-gray-500">Ghi chú</th>
                    <th className="px-6 py-3 font-right text-gray-500 truncate w-32">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {scores.map((scoreItem) => (
                    <tr key={scoreItem.id || scoreItem.sessionId} className="hover:bg-gray-50/50 transition">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 truncate max-w-[150px]" title={scoreItem.sessionId}>
                           {scoreItem.sessionId}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center text-gray-600">{scoreItem.listening ?? '-'}</td>
                      <td className="px-4 py-4 text-center text-gray-600">{scoreItem.reading ?? '-'}</td>
                      <td className="px-4 py-4 text-center text-gray-600">{scoreItem.writing ?? '-'}</td>
                      <td className="px-4 py-4 text-center text-gray-600">{scoreItem.speaking ?? '-'}</td>
                      <td className="px-6 py-4">
                        {scoreItem.total !== null ? (
                          <span className="font-bold text-blue-600 text-base">{scoreItem.total}</span>
                        ) : (
                          <span className="text-gray-400 italic font-medium">Chưa chấm</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-700 max-w-[200px] truncate">
                         {scoreItem.note || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => navigate(RoutePaths.SESSION_DETAIL.replace(':sessionId', scoreItem.sessionId))}
                          className="text-indigo-600 hover:text-indigo-800 font-medium text-[13px] bg-indigo-50 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition"
                        >
                          Tới Session
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </PageShell>
  );
};

export default StudentScoreHistoryPage;
