/**
 * Trang danh sách Trial Leads (Quản lý Học thử)
 * Hiển thị bảng danh sách khách hàng tiềm năng kèm filter và nút thêm mới
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrialTable } from '@/presentation/components/trials/trial-table';
import { TrialForm } from '@/presentation/components/trials/trial-form';
import { ScheduleTrialModal } from '@/presentation/components/trials/schedule-trial-modal';
import { Modal } from '@/shared/ui/modal';
import { useTrials } from '@/presentation/hooks/trials/use-trials';
import { useCreateTrial } from '@/presentation/hooks/trials/use-trial-mutations';
import { useAuth } from '@/presentation/hooks/auth/use-auth';
import { RoutePaths } from '@/app/router/route-paths';
import type { TrialListParams } from '@/application/trials/dto/trials.dto';
import type { TrialLeadModel } from '@/domain/trials/models/trial-lead.model';
import { ExportExcelButton } from '@/presentation/components/common/export-excel-button';
import { useTrialsPermission } from '@/presentation/hooks/trials/use-trials-permission';
import { useMutation } from '@tanstack/react-query';
import { trialsApi } from '@/infrastructure/services/trials.api';
import { toastAdapter } from '@/infrastructure/adapters/toast.adapter';
import { mapHttpError } from '@/infrastructure/http/http-error.mapper';

interface TrialListPageState extends TrialListParams {
  page: number;
}

const TrialListPage = () => {
  const navigate = useNavigate();
  const { hasAnyRole } = useAuth();
  const { canRead, canWrite } = useTrialsPermission();
  
  // ---- STATE: Filter & Pagination ----
  const [params, setParams] = useState<TrialListPageState>({
    page: 1,
    limit: 10,
    search: '',
    status: undefined,
  });

  // ---- STATE: Modal Tạo mới ----
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  // ---- STATE: Modal Đặt lịch học thử ----
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedTrial, setSelectedTrial] = useState<TrialLeadModel | null>(null);

  // ---- HOOKS: Data Fetching ----
  const { data, isLoading } = useTrials({
    search: params.search,
    status: params.status,
    limit: params.limit,
    offset: (params.page - 1) * (params.limit || 10),
  });

  const { mutate: createTrial, isPending: isCreating } = useCreateTrial();

  const exportMutation = useMutation({
    mutationFn: () =>
      trialsApi.exportTrialsExcel({
        search: params.search || undefined,
        status: params.status,
        limit: 1000,
      }),
    onMutate: () => {
      toastAdapter.info('Bắt đầu xuất Excel. Nếu dữ liệu lớn, vui lòng chờ...');
    },
    onSuccess: () => {
      toastAdapter.success('Đã hoàn tất xử lý và bắt đầu tải file Excel.');
    },
    onError: (error) => {
      toastAdapter.error(mapHttpError(error));
    },
  });

  // ---- HANDLERS ----
  const handleAddLead = () => setIsCreateModalOpen(true);
  
  const handleCreateSubmit = (formData: any) => {
    createTrial(formData, {
      onSuccess: () => {
        setIsCreateModalOpen(false);
      }
    });
  };

  const handleFilterChange = (filters: any) => {
    setParams((prev: any) => ({ ...prev, ...filters, page: 1 }));
  };

  const handleSchedule = (trialId: string) => {
    const trial = (data?.items ?? []).find((t) => t.id === trialId) ?? null;
    setSelectedTrial(trial);
    setIsScheduleModalOpen(true);
  };

  /** Chức năng chỉ cho phép role có quyền ghi (WRITE) thêm lead */
  const canAdd = hasAnyRole(['SALES', 'ROOT']);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* ---- HEADER & BREADCRUMB ---- */}
      <div className="flex items-start justify-between gap-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>Tuyển sinh</span>
            <span>/</span>
            <span className="text-gray-900 font-medium">Danh sách học thử</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Quản lý Trial Leads</h1>
        </div>

        <div className="shrink-0">
          <ExportExcelButton
            onExport={() => exportMutation.mutateAsync()}
            disabled={!canRead}
            isLoading={exportMutation.isPending}
            title={!canRead ? 'Bạn không có quyền xem dữ liệu học thử.' : 'Xuất danh sách trial ra Excel'}
            label="Xuất Excel"
          />
        </div>
      </div>

      {/* ---- MAIN TABLE ---- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        {exportMutation.isPending && (
          <div className="mb-3 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-md px-3 py-2">
            Hệ thống đang xử lý file export. Không cần bấm lại nút xuất trong lúc đang chạy.
          </div>
        )}
        <TrialTable
          items={data?.items ?? []}
          loading={isLoading}
          canAdd={canAdd}
          canWriteActions={canWrite}
          onAdd={handleAddLead}
          onView={(id) => navigate(RoutePaths.TRIAL_DETAIL.replace(':id', id))}
          onEdit={(id) => navigate(RoutePaths.TRIAL_EDIT.replace(':id', id))} // Tạm giả định route Edit
          onSchedule={handleSchedule}
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* ---- MODAL: TẠO LEAD MỚI (INLINE) ---- */}
      <Modal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Thêm khách hàng tiềm năng mới"
        className="max-w-md"
      >
        <div className="p-1">
          <TrialForm 
            mode="create" 
            isLoading={isCreating} 
            onSubmit={handleCreateSubmit} 
          />
        </div>
      </Modal>

      {/* ---- MODAL: ĐẶT LỊCH HỌC THỬ ---- */}
      {selectedTrial && (
        <ScheduleTrialModal
          open={isScheduleModalOpen}
          onClose={() => {
            setIsScheduleModalOpen(false);
            setSelectedTrial(null);
          }}
          trial={selectedTrial}
        />
      )}
    </div>
  );
};

export default TrialListPage;
