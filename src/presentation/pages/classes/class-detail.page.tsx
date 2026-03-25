import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Calendar, Users, GraduationCap, Lock } from 'lucide-react';

import PageShell from '../../layouts/page-shell';
import { useClass, useClassRoster } from '../../hooks/classes/use-classes';
import { useCloseClass } from '../../hooks/classes/use-class-mutations';
import { StatusBadge } from '../../components/common/status-badge';
import { ProtectedAction } from '../../components/common/protected-action';
import { AppRoles } from '../../../shared/constants/roles';
import { ClassStatus } from '../../../domain/classes/models/class.model';
import { Loading } from '../../../shared/ui/feedback/loading';
import { ErrorState } from '../../../shared/ui/feedback/error-state';

import { ClassRosterTab } from '../../components/classes/class-roster-tab';
import { ClassSchedulesTab } from '../../components/classes/class-schedules-tab';
import { ClassStaffTab } from '../../components/classes/class-staff-tab';
import { ConfirmDialog } from '../../components/common/confirm-dialog';
import { RoutePaths } from '../../../app/router/route-paths';

export const ClassDetailPage = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'roster' | 'schedules' | 'staff'>('roster');
  // State điều khiển hiển thị ConfirmDialog khi đóng lớp
  const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false);

  // Load Data
  const { data: classDetail, isLoading, isError, refetch } = useClass(classId);
  const { data: roster } = useClassRoster(classId);
  const { mutate: closeClass, isPending: isClosing } = useCloseClass(classId);

  if (isLoading) {
    return (
      <PageShell title="Chi tiết Lớp học">
        <Loading text="Đang tải thông tin lớp học..." className="py-20" />
      </PageShell>
    );
  }

  if (isError || !classDetail) {
    return (
      <PageShell title="Chi tiết Lớp học">
        <ErrorState 
          title="Không tìm thấy lớp học" 
          message="Lớp học bạn cần tìm không tồn tại hoặc đã bị xóa."
          onRetry={() => refetch()}
        />
      </PageShell>
    );
  }

  // Mở dialog xác nhận — không dùng window.confirm
  const handleCloseClass = () => {
    setIsCloseConfirmOpen(true);
  };

  // Callback sau khi người dùng bấm xác nhận
  const handleConfirmClose = () => {
    closeClass(undefined, {
      onSuccess: () => setIsCloseConfirmOpen(false),
      onError: () => setIsCloseConfirmOpen(false),
    });
  };

  const getStatusProps = (status: ClassStatus) => {
    switch (status) {
      case ClassStatus.ACTIVE:
        return { variant: 'active' as const, label: 'Đang hoạt động' };
      case ClassStatus.PAUSED:
        return { variant: 'pending' as const, label: 'Tạm dừng' };
      case ClassStatus.CLOSED:
        return { variant: 'inactive' as const, label: 'Đã đóng' };
      default:
        return { variant: 'inactive' as const, label: 'Không rõ' };
    }
  };

  const statusProps = getStatusProps(classDetail.status);
  const currentRosterSize = roster ? roster.length : 0;
  const isClassFull = currentRosterSize >= classDetail.capacity;

  return (
    <PageShell
      title={`Chi tiết lớp: ${classDetail.name}`}
      subtitle="Quản lý danh sách học viên, lịch học và phân công giáo viên"
      actions={
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate(RoutePaths.CLASSES)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Quay lại</span>
          </button>
          
          <ProtectedAction allowedRoles={[AppRoles.ROOT, AppRoles.ACADEMIC]}>
            {classDetail.status === ClassStatus.ACTIVE && (
              <button
                onClick={handleCloseClass}
                disabled={isClosing}
                className="px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Đóng lớp</span>
              </button>
            )}

            <button
              onClick={() => navigate(RoutePaths.CLASS_EDIT.replace(':classId', classId!))}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              <span>Sửa thông tin</span>
            </button>
          </ProtectedAction>
        </div>
      }
    >
      <div className="flex flex-col gap-6 mt-4">
        {/* General Info Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 md:items-start justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <h2 className="text-2xl font-bold text-gray-900">{classDetail.name}</h2>
              <StatusBadge status={statusProps.variant} label={statusProps.label} className="text-sm px-2.5 py-0.5" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <span className="font-medium text-gray-900 w-24">Mã lớp:</span>
                <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-800">{classDetail.code}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="font-medium text-gray-900 w-24">Chương trình:</span>
                <span>{classDetail.programId}</span> {/* Cần ánh xạ tên chương trình nếu có */}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="font-medium text-gray-900 w-24">Sĩ số:</span>
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${isClassFull ? 'text-red-600' : 'text-indigo-600'}`}>
                    {currentRosterSize}
                  </span>
                  <span>/</span>
                  <span>{classDetail.capacity}</span>
                  {isClassFull && (
                    <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium">Đã đầy</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="font-medium text-gray-900 w-24">Khởi giảng:</span>
                <span>{new Date(classDetail.startDate).toLocaleDateString('vi-VN')}</span>
              </div>
              {classDetail.room && (
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="font-medium text-gray-900 w-24">Phòng / Lịch:</span>
                  <span>{classDetail.room}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex overflow-x-auto border-b border-gray-100 hide-scrollbar bg-gray-50/50">
            <button
              onClick={() => setActiveTab('roster')}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 relative ${
                activeTab === 'roster'
                  ? 'text-indigo-600 bg-white border-t border-t-indigo-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-t border-t-transparent'
              }`}
            >
              <Users className="w-4 h-4" />
              Danh sách học viên
            </button>
            <button
              onClick={() => setActiveTab('schedules')}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 relative ${
                activeTab === 'schedules'
                 ? 'text-indigo-600 bg-white border-t border-t-indigo-600'
                 : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-t border-t-transparent'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Lịch buổi học
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 relative ${
                activeTab === 'staff'
                 ? 'text-indigo-600 bg-white border-t border-t-indigo-600'
                 : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-t border-t-transparent'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Giáo viên & TA
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'roster' && (
              <ClassRosterTab classId={classId!} capacity={classDetail.capacity} currentSize={currentRosterSize} />
            )}
            {activeTab === 'schedules' && (
              <ClassSchedulesTab classId={classId!} schedules={classDetail.schedules ?? []} />
            )}
            {activeTab === 'staff' && (
              <ClassStaffTab classId={classId!} defaultStaff={classDetail.staff || []} />
            )}
          </div>
        </div>
      </div>
      {/* ConfirmDialog đóng lớp — thay thế window.confirm */}
      <ConfirmDialog
        isOpen={isCloseConfirmOpen}
        title="Đóng lớp học"
        message={`Bạn có chắc muốn đóng lớp "${classDetail?.name}"? Hành động này không thể hoàn tác và lớp sẽ không nhận thêm học viên mới.`}
        confirmLabel="Đóng lớp"
        cancelLabel="Huỷ"
        isDangerous
        isLoading={isClosing}
        onConfirm={handleConfirmClose}
        onCancel={() => setIsCloseConfirmOpen(false)}
      />
    </PageShell>
  );
};

export default ClassDetailPage;
