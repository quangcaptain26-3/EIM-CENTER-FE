import { useParams, useNavigate } from 'react-router-dom';
import { useState, useCallback } from 'react';
import { Edit, BookOpen, ArrowLeft, BarChart2 } from 'lucide-react';

import { RoutePaths } from '@/app/router/route-paths';

import { PageShell } from '@/presentation/components/common/page-shell';
import { ProtectedAction } from '@/presentation/components/common/protected-action';
import { AppRoles } from '@/shared/constants/roles';
import { Loading } from '@/shared/ui/feedback/loading';
import { EmptyState } from '@/shared/ui/feedback/empty';
import { useStudent, useStudentEnrollments } from '@/presentation/hooks/students';
import { StudentProfileCard } from '@/presentation/components/students/student-profile-card';
import { EnrollmentList } from '@/presentation/components/students/enrollment-list';
import type { EnrollmentModel } from '@/domain/students/models/enrollment.model';

// Import Modals
import { CreateEnrollmentModal } from '@/presentation/components/students/create-enrollment-modal';
import { UpdateEnrollmentStatusModal } from '@/presentation/components/students/update-enrollment-status-modal';
import { TransferEnrollmentModal } from '@/presentation/components/students/transfer-enrollment-modal';

/**
 * Trang chi tiết học viên (Profile & Enrollments)
 */
export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Load Data chi tiết học viên và các lớp ghi danh
  const { data: student, isLoading: isStudentLoading, isError: isStudentError } = useStudent(id);
  const { data: enrollments, isLoading: isEnrollmentsLoading } = useStudentEnrollments(id);

  // States quản lý Modals
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  
  // Lưu state xem enrollment nào đang được pop-up (Status / Transfer)
  const [targetEnrollment, setTargetEnrollment] = useState<EnrollmentModel | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  // Handlers
  const handleEditStudent = useCallback(() => {
    navigate(RoutePaths.STUDENT_EDIT.replace(':id', id as string));
  }, [id, navigate]);

  const handleUpdateEnrollmentStatus = useCallback((enrollmentId: string) => {
    const enrol = enrollments?.find((e) => e.id === enrollmentId);
    if (enrol) {
      setTargetEnrollment(enrol);
      setIsStatusModalOpen(true);
    }
  }, [enrollments]);

  const handleTransferEnrollment = useCallback((enrollmentId: string) => {
    const enrol = enrollments?.find((e) => e.id === enrollmentId);
    if (enrol) {
      setTargetEnrollment(enrol);
      setIsTransferModalOpen(true);
    }
  }, [enrollments]);

  const handleViewFinance = useCallback((enrollmentId: string) => {
    navigate(RoutePaths.STUDENT_FINANCE.replace(':enrollmentId', enrollmentId));
  }, [navigate]);

  if (isStudentLoading) {
    return (
      <PageShell title="Chi tiết học viên">
        <Loading text="Đang tải hồ sơ học viên..." className="py-20" />
      </PageShell>
    );
  }

  if (isStudentError || !student) {
    return (
      <PageShell title="Chi tiết học viên">
        <EmptyState
          title="Không tìm thấy học viên"
          description="Học viên bạn cần tìm không tồn tại hoặc đã bị xóa."
          action={
            <button onClick={() => navigate(RoutePaths.STUDENTS)} className="text-indigo-600 font-medium">
              ← Quay lại danh sách
            </button>
          }
        />
      </PageShell>
    );
  }

  return (
    <>
      <PageShell
        title="Hồ sơ học viên"
        description="Xem thông tin chi tiết và lịch sử khóa học của học viên."
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => navigate(RoutePaths.STUDENTS)}
              className="px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-md transition-colors flex items-center gap-2 shadow-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Trở về</span>
            </button>

            {/* Nút điều hướng sang trang lịch sử điểm của học viên */}
            <button
              onClick={() => navigate(RoutePaths.STUDENT_SCORE_HISTORY.replace(':studentId', id as string))}
              className="px-4 py-2 border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors flex items-center gap-2 shadow-sm font-medium"
            >
              <BarChart2 className="w-4 h-4" />
              <span className="hidden sm:inline">Lịch sử điểm</span>
            </button>

            <ProtectedAction allowedRoles={[AppRoles.ROOT, AppRoles.ACADEMIC]}>
              <button
                onClick={handleEditStudent}
                className="px-4 py-2 border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 rounded-md transition-colors flex items-center gap-2 shadow-sm font-medium"
              >
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline">Chỉnh sửa</span>
              </button>
              
              <button
                onClick={() => setIsEnrollModalOpen(true)}
                className="px-4 py-2 bg-primary text-white hover:bg-primary-light rounded-md transition-colors flex items-center gap-2 shadow-sm font-medium"
              >
                <BookOpen className="w-4 h-4" />
                <span>Ghi danh</span>
              </button>
            </ProtectedAction>
          </div>
        }
      >
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-1/3 flex flex-col gap-6">
            <StudentProfileCard student={student} />
          </div>

          <div className="w-full lg:w-2/3 flex flex-col gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4 mb-4">
                Khóa học đã tham gia
              </h3>
              
              <EnrollmentList 
                enrollments={enrollments || []}
                loading={isEnrollmentsLoading}
                onUpdateStatus={handleUpdateEnrollmentStatus}
                onTransfer={handleTransferEnrollment}
                onViewFinance={handleViewFinance}
              />
            </div>
          </div>
        </div>
      </PageShell>

      {/* RENDER CÁC MODALS CHO TRANG DETAIL (Chỉ mount khi id tồn tại) */}
      {id && (
        <>
          <CreateEnrollmentModal
            open={isEnrollModalOpen}
            onClose={() => setIsEnrollModalOpen(false)}
            studentId={id}
          />
          <UpdateEnrollmentStatusModal
            open={isStatusModalOpen}
            onClose={() => {
              setIsStatusModalOpen(false);
              setTargetEnrollment(null);
            }}
            studentId={id}
            enrollment={targetEnrollment}
          />
          <TransferEnrollmentModal
            open={isTransferModalOpen}
            onClose={() => {
              setIsTransferModalOpen(false);
              setTargetEnrollment(null);
            }}
            studentId={id}
            enrollment={targetEnrollment}
          />
        </>
      )}
    </>
  );
}
