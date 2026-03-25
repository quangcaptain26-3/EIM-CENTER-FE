import { RefreshCw, MapPin, Wallet, AlertTriangle } from 'lucide-react';
import type { EnrollmentModel } from '@/domain/students/models/enrollment.model';
import { EmptyState } from '@/shared/ui/feedback/empty';
import { Loading } from '@/shared/ui/feedback/loading';
import { formatDate } from '@/shared/lib/date';
import { EnrollmentStatusBadge } from './enrollment-status-badge';
import { ProtectedAction } from '@/presentation/components/common/protected-action';

export interface EnrollmentListProps {
  enrollments: EnrollmentModel[];
  loading?: boolean;
  onUpdateStatus?: (enrollmentId: string) => void;
  onTransfer?: (enrollmentId: string) => void;
  onViewFinance?: (enrollmentId: string) => void;
}

/**
 * Hiển thị danh sách các lớp học viên đã / đang ghi danh
 */
export const EnrollmentList = ({ enrollments, loading, onUpdateStatus, onTransfer, onViewFinance }: EnrollmentListProps) => {
  if (loading) {
    return <Loading text="Đang tải danh sách ghi danh..." className="py-10" />;
  }

  if (!enrollments || enrollments.length === 0) {
    return (
      <EmptyState
        title="Chưa có thông tin ghi danh"
        description="Học viên này chưa được xếp vào lớp nào."
        className="bg-gray-50 rounded-lg border border-dashed border-gray-200"
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {enrollments.map((enrollment) => (
        <div 
          key={enrollment.id}
          className="enrollment-list-item"
        >
          {/* Thông tin lớp */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="font-semibold text-lg text-gray-900">
                {enrollment.classCode ?? `Lớp ${enrollment.classId?.slice(0, 8) ?? '—'}...`}
              </h3>
              <EnrollmentStatusBadge status={enrollment.status} />
              {enrollment.attendanceSummary?.isAtRisk && (
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-800 border border-amber-200"
                  title={`Vắng ${enrollment.attendanceSummary.absentCount}/${enrollment.attendanceSummary.totalSessions} buổi (ngưỡng cảnh báo: ${enrollment.attendanceSummary.warningThreshold})`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Cảnh báo chuyên cần
                </span>
              )}
            </div>
            
            <div className="flex gap-6 mt-1 text-sm text-gray-500">
              <div className="flex flex-col">
                <span className="text-gray-400 text-xs">Ngày bắt đầu</span>
                <span className="font-medium text-gray-700">{formatDate(enrollment.startDate)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-400 text-xs">Ngày kết thúc</span>
                <span className="font-medium text-gray-700">{formatDate(enrollment.endDate)}</span>
              </div>
            </div>
          </div>

          {/* Action buttons (Role-based) */}
          <div className="flex items-center gap-2 pt-2 sm:pt-0 sm:self-center border-t sm:border-t-0 border-gray-100">
              <ProtectedAction allowedRoles={['ROOT', 'DIRECTOR', 'ACADEMIC', 'ACCOUNTANT']}>
                <div className="flex gap-2 w-full sm:w-auto">
                    {/* Nút Xem tài chính (Chỉ dành cho Accountant/Director/Root) */}
                    <ProtectedAction allowedRoles={['ROOT', 'DIRECTOR', 'ACCOUNTANT']}>
                      <button
                        onClick={() => onViewFinance?.(enrollment.id)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                      >
                        <Wallet className="w-3.5 h-3.5" />
                        Xem tài chính
                      </button>
                    </ProtectedAction>

                    <ProtectedAction allowedRoles={['ROOT', 'ACADEMIC']}>
                      <div className="flex gap-2">
                        {/* Chỉ active/paused mới nên transfer */}
                        {(enrollment.status === 'ACTIVE' || enrollment.status === 'PAUSED') && (
                          <button
                            onClick={() => onTransfer?.(enrollment.id)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-md transition-colors"
                          >
                            <MapPin className="w-3.5 h-3.5" />
                            Chuyển lớp
                          </button>
                        )}
                        
                        <button
                          onClick={() => onUpdateStatus?.(enrollment.id)}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Đổi trạng thái
                        </button>
                      </div>
                    </ProtectedAction>
                </div>
            </ProtectedAction>
          </div>
        </div>
      ))}
    </div>
  );
};
