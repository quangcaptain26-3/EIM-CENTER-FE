/**
 * src/presentation/pages/feedback/session-feedback.page.tsx
 * Trang quản lý nhập Đánh giá và Điểm số cho toàn bộ học viên trong một Buổi Học (Session).
 * Kết hợp danh sách Roster và các Form nhập liệu trong cùng một màn hình.
 */
import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';

import { PageShell } from '@/presentation/components/common/page-shell';
import { ImportFeedbackModal } from '@/presentation/components/feedback/import-feedback-modal';
import { SessionFeedbackToolbar } from '@/presentation/components/feedback/session-feedback-toolbar';
import { SessionTypeBadge } from '@/presentation/components/sessions/session-type-badge';
import { FeedbackFormRow } from '@/presentation/components/feedback/feedback-form-row';

import { useAuth } from '@/presentation/hooks/auth/use-auth';
import { useSessionFeedbackPageState } from '@/presentation/hooks/feedback/use-session-feedback-page';
import { useDownloadFeedbackTemplate } from '@/presentation/hooks/feedback/use-feedback-mutations';
import { useFeedbackExportJobActions } from '@/presentation/hooks/feedback/use-feedback-mutations';
import { toastAdapter } from '@/infrastructure/adapters/toast.adapter';
import { mapHttpError } from '@/infrastructure/http/http-error.mapper';

import { RoutePaths } from '@/app/router/route-paths';
import { Loading } from '@/shared/ui/feedback/loading';
import { ErrorState } from '@/shared/ui/feedback/error-state';
import { EmptyState } from '@/shared/ui/feedback/empty';

import type { FeedbackRowModel } from '@/domain/feedback/models/feedback.model';
import { getSessionFeedbackVisibility } from '@/domain/feedback/rules/feedback-visibility.rule';

export const SessionFeedbackPage = () => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [activeExportJobId, setActiveExportJobId] = useState<string | null>(null);
  const [activeExportStatus, setActiveExportStatus] = useState<'queued' | 'running' | 'completed' | 'failed' | 'cancelled' | null>(null);
  const [activeExportProgress, setActiveExportProgress] = useState(0);
  const [activeExportError, setActiveExportError] = useState<string | null>(null);
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Data state: một nguồn sự thật cho page
  const safeSessionId = sessionId ?? '';
  const { session, rows: feedbackList, isLoading, isError, refetchAll } = useSessionFeedbackPageState(safeSessionId);

  // Action state: chỉ lo IO (template/export), không trộn vào data state
  // Lưu ý: truyền id "an toàn" để đảm bảo thứ tự hooks luôn ổn định giữa các render.
  const downloadTemplateMutation = useDownloadFeedbackTemplate(safeSessionId);
  const exportJobActions = useFeedbackExportJobActions(session?.classId ?? '');
  const getExportJob = exportJobActions.getJob;

  // BẮT BUỘC đặt mọi hook trước mọi return sớm (tránh "Rendered more hooks than during the previous render").
  const exportStatusLabel = useMemo(() => {
    if (!activeExportStatus) return null;
    if (activeExportStatus === 'queued') return 'Đang xếp hàng';
    if (activeExportStatus === 'running') return 'Đang xử lý';
    if (activeExportStatus === 'completed') return 'Hoàn tất';
    if (activeExportStatus === 'failed') return 'Thất bại';
    if (activeExportStatus === 'cancelled') return 'Đã hủy';
    return activeExportStatus;
  }, [activeExportStatus]);

  useEffect(() => {
    if (!activeExportJobId || !session?.classId) return;
    if (activeExportStatus === 'completed' || activeExportStatus === 'failed' || activeExportStatus === 'cancelled') return;

    const timer = window.setInterval(async () => {
      try {
        const job = await getExportJob(activeExportJobId);
        const normalizedStatus = job.status;
        setActiveExportStatus(normalizedStatus);
        setActiveExportProgress(job.progress ?? 0);
        setActiveExportError(job.error ?? null);

        if (normalizedStatus === 'completed') {
          toastAdapter.success('Báo cáo đã sẵn sàng. Bạn có thể bấm "Tải file".');
        }
        if (normalizedStatus === 'failed') {
          toastAdapter.error(job.error || 'Export thất bại. Bạn có thể thử lại.');
        }
      } catch (err) {
        setActiveExportStatus('failed');
        setActiveExportError(mapHttpError(err));
      }
    }, 2000);

    return () => window.clearInterval(timer);
  }, [activeExportJobId, activeExportStatus, getExportJob, session?.classId]);

  if (!sessionId) {
    return (
      <PageShell title="Quản lý Đánh giá">
        <ErrorState
          title="Thiếu sessionId"
          message="Đường dẫn không hợp lệ hoặc thiếu tham số buổi học."
          onRetry={() => navigate(RoutePaths.MY_SESSIONS)}
        />
      </PageShell>
    );
  }

  if (isLoading) {
    return (
      <PageShell title="Quản lý Đánh giá">
        <Loading text="Đang tải dữ liệu nhận xét..." className="py-20" />
      </PageShell>
    );
  }

  if (isError || !session) {
    return (
      <PageShell title="Quản lý Đánh giá">
        <ErrorState
          title="Không tìm thấy thông tin"
          message="Buổi học này có thể không tồn tại hoặc bạn không có quyền xem."
          onRetry={refetchAll}
        />
      </PageShell>
    );
  }

  const visibility = getSessionFeedbackVisibility({
    roles: user?.roles ?? [],
    userId: user?.id,
    session,
  });

  // Form chỉ cho sửa khi là giáo viên đứng lớp (visibility rule ở FE).
  const isFormDisabled = !visibility.canEdit;

  const handleDownloadTemplate = async () => {
    try {
      toastAdapter.info('Bắt đầu tải template...');
      await downloadTemplateMutation.mutateAsync();
      toastAdapter.success('Đã gửi yêu cầu tải template. Nếu chưa thấy file, hãy kiểm tra trình duyệt có chặn download không.');
    } catch (err) {
      toastAdapter.error(mapHttpError(err));
    }
  };

  const handleExportReport = async () => {
    if (!session?.classId) return;
    try {
      toastAdapter.info('Đã tạo yêu cầu xuất báo cáo. Hệ thống đang xếp hàng xử lý...');
      const created = await exportJobActions.createJob({
        sessionId: session.id,
        includeScores: true,
      });
      setActiveExportJobId(created.jobId);
      setActiveExportStatus('queued');
      setActiveExportProgress(created.progress ?? 0);
      setActiveExportError(null);
    } catch (err) {
      toastAdapter.error(mapHttpError(err));
    }
  };

  const handleCancelExport = async () => {
    if (!activeExportJobId) return;
    try {
      await exportJobActions.cancelJob(activeExportJobId);
      setActiveExportStatus('cancelled');
      setActiveExportProgress(100);
      toastAdapter.warning('Đã gửi yêu cầu hủy export.');
    } catch (err) {
      toastAdapter.error(mapHttpError(err));
    }
  };

  const handleRetryExport = async () => {
    if (!activeExportJobId) return;
    try {
      await exportJobActions.retryJob(activeExportJobId);
      setActiveExportStatus('queued');
      setActiveExportProgress(0);
      setActiveExportError(null);
      toastAdapter.info('Đã retry export. Hệ thống đang xử lý lại...');
    } catch (err) {
      toastAdapter.error(mapHttpError(err));
    }
  };

  const handleDownloadExport = async () => {
    if (!activeExportJobId) return;
    try {
      toastAdapter.info('Bắt đầu tải file export...');
      await exportJobActions.downloadJob(activeExportJobId);
      toastAdapter.success('Đã hoàn tất export và bắt đầu tải file.');
    } catch (err) {
      toastAdapter.error(mapHttpError(err));
    }
  };

  const readonlyReason = visibility.readonlyReason;

  // Formatting strings
  const formattedDate = new Date(session.sessionDate).toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const courseSectionText = `Unit ${session.unitNo} ${session.lessonNo ? "— Bài " + session.lessonNo : ""}`;


  return (
    <PageShell
      title={`Đánh giá Lớp: Bài ${session.lessonNo || session.unitNo} (${formattedDate})`}
      description="Giáo viên đóng vai trò nhận xét, điểm danh và chấm bài trên từng học viên."
      actions={
        <div className="flex gap-2">
          {/* Nút lùi về chi tiết Session */}
          <button
            onClick={() => navigate(RoutePaths.SESSION_DETAIL.replace(':sessionId', session.id))}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Quay lại buối học</span>
          </button>

          {/* Nhóm action: template / export report / import */}
          <SessionFeedbackToolbar
            visible={visibility.canDownloadTemplate || visibility.canExportReport || visibility.canImportFeedback}
            showDownloadTemplate={visibility.canDownloadTemplate}
            showExportReport={visibility.canExportReport}
            showImportFeedback={visibility.canImportFeedback}
            onDownloadTemplate={handleDownloadTemplate}
            isDownloadingTemplate={downloadTemplateMutation.isPending || exportJobActions.isCreatingJob}
            onExportReport={handleExportReport}
            isExportingReport={Boolean(exportJobActions.isCreatingJob || (activeExportStatus === 'queued' || activeExportStatus === 'running'))}
            onOpenImport={() => setIsImportModalOpen(true)}
          />
        </div>
      }
    >
      <div className="flex flex-col gap-6 mt-4">
        {/* === HEADER TỔNG QUAN BÀI === */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-50 p-3 border border-indigo-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase">Tiến trình lớp học</div>
              <div className="text-sm font-bold text-gray-900 mt-0.5">{courseSectionText}</div>
              <div className="text-sm text-gray-600">Giáo viên: <span className="font-medium text-gray-900">{session.teacherEffectiveName || 'Chưa phân công'}</span></div>
            </div>
          </div>
          <div>
             <SessionTypeBadge type={session.type} size="md" />
             {readonlyReason && (
               <div className="text-xs text-amber-700 font-medium mt-2 bg-amber-50 px-2 py-1 rounded border border-amber-200">{readonlyReason}</div>
             )}
          </div>

        </div>

        {/* === BODY: DANH SÁCH HỌC VIÊN (ROSTER) CHỜ ĐÁNH GIÁ === */}
        {activeExportJobId && exportStatusLabel && (
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="text-sm">
                <span className="font-semibold text-slate-900">Trạng thái export: </span>
                <span
                  className={
                    activeExportStatus === 'completed'
                      ? 'text-emerald-700 font-semibold'
                      : activeExportStatus === 'failed'
                      ? 'text-red-700 font-semibold'
                      : activeExportStatus === 'cancelled'
                      ? 'text-amber-700 font-semibold'
                      : 'text-blue-700 font-semibold'
                  }
                >
                  {exportStatusLabel}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {(activeExportStatus === 'queued' || activeExportStatus === 'running') && (
                  <button
                    type="button"
                    onClick={handleCancelExport}
                    className="px-3 py-1.5 text-sm rounded-md border border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100"
                    disabled={exportJobActions.isCancellingJob}
                  >
                    {exportJobActions.isCancellingJob ? 'Đang hủy...' : 'Hủy'}
                  </button>
                )}
                {activeExportStatus === 'failed' && (
                  <button
                    type="button"
                    onClick={handleRetryExport}
                    className="px-3 py-1.5 text-sm rounded-md border border-slate-300 text-slate-800 bg-white hover:bg-slate-50"
                    disabled={exportJobActions.isRetryingJob}
                  >
                    {exportJobActions.isRetryingJob ? 'Đang thử lại...' : 'Thử lại'}
                  </button>
                )}
                {activeExportStatus === 'completed' && (
                  <button
                    type="button"
                    onClick={handleDownloadExport}
                    className="px-3 py-1.5 text-sm rounded-md border border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100"
                    disabled={exportJobActions.isDownloadingJob}
                  >
                    {exportJobActions.isDownloadingJob ? 'Đang tải...' : 'Tải file'}
                  </button>
                )}
              </div>
            </div>
            <div className="mt-3 w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={
                  activeExportStatus === 'failed'
                    ? 'h-full bg-red-500 transition-all'
                    : activeExportStatus === 'cancelled'
                    ? 'h-full bg-amber-500 transition-all'
                    : 'h-full bg-blue-500 transition-all'
                }
                style={{ width: `${Math.max(0, Math.min(100, activeExportProgress))}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-slate-500">
              {activeExportStatus === 'queued' || activeExportStatus === 'running'
                ? 'Export lớn có thể mất vài phút. Bạn có thể tiếp tục thao tác và theo dõi tiến trình ở đây.'
                : activeExportError || 'Tiến trình đã cập nhật xong.'}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4">
           {feedbackList.length === 0 ? (
             <div className="bg-white border rounded-xl overflow-hidden py-10">
               <EmptyState title="Sĩ số lớp trống" description="Chưa có học viên nào được ghi danh vào lớp học này." />
             </div>
           ) : (
             feedbackList.map((feedbackRawItem) => {
               // FeedbackList item từ useSessionFeedback trả về Flat Object
               // Phải tái cấu hình nhẹ lại cho khớp với Props của `<FeedbackFormRow />`
               
               // Thông tin Điểm danh/Thái độ
               const existingFb: FeedbackRowModel = feedbackRawItem;

               // Part 3.1: Endpoint list session feedback chỉ trả feedback (không kèm scores).
               // Điểm số sẽ được nhập qua flow riêng (hoặc query riêng) ở các phần sau.
               const existingSc = null;

               return (
                  <FeedbackFormRow
                    key={feedbackRawItem.studentId}
                    sessionId={session.id}
                    studentId={feedbackRawItem.studentId}
                    studentName={feedbackRawItem.studentName}
                    sessionType={session.type}
                    existingFeedback={feedbackRawItem.feedbackId ? existingFb : null}
                    existingScore={existingSc}
                    disabled={isFormDisabled}
                  />
               );
             })
           )}
        </div>
      </div>

      <ImportFeedbackModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        sessionId={session.id}
      />
    </PageShell>
  );
};

export default SessionFeedbackPage;
