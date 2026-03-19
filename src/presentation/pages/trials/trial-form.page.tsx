/**
 * Trang tạo mới và chỉnh sửa Trial Lead (Khách hàng tiềm năng học thử)
 * Hỗ trợ 2 chế độ:
 * - Create: Khi url không có :id
 * - Edit: Khi url có :id, tự động load data và fill vào form
 * Chặn chỉnh sửa nếu Lead đã được CONVERTED
 */

import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { TrialForm } from '@/presentation/components/trials/trial-form';
import { Loading } from '@/shared/ui/feedback/loading';
import { EmptyState } from '@/shared/ui/feedback/empty';
import { useTrial } from '@/presentation/hooks/trials/use-trials';
import { useCreateTrial, useUpdateTrial } from '@/presentation/hooks/trials/use-trial-mutations';
import { toastAdapter } from '@/infrastructure/adapters/toast.adapter';
import { isConverted } from '@/domain/trials/rules/trial.rule';
import { RoutePaths } from '@/app/router/route-paths';

const TrialFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // ---- HOOKS: Data Fetching (chế độ Edit) ----
  const { data: trial, isLoading: isLoadingTrial, error } = useTrial(id || '');

  // ---- HOOKS: Mutations ----
  const { mutate: createTrial, isPending: isCreating } = useCreateTrial();
  const { mutate: updateTrial, isPending: isUpdating } = useUpdateTrial(id || '');

  // ---- Logic chặn sửa nếu đã CONVERTED ----
  useEffect(() => {
    if (trial && isConverted(trial)) {
      toastAdapter.warning('Không thể chỉnh sửa khách hàng đã chuyển đổi thành học viên.');
      navigate(RoutePaths.TRIAL_DETAIL.replace(':id', trial.id), { replace: true });
    }
  }, [trial, navigate]);

  // ---- HANDLERS ----
  const handleSubmit = (formData: any) => {
    if (isEditMode) {
      updateTrial(formData, {
        onSuccess: () => navigate(RoutePaths.TRIAL_DETAIL.replace(':id', id as string))
      });
    } else {
      createTrial(formData, {
        onSuccess: (result: any) => navigate(RoutePaths.TRIAL_DETAIL.replace(':id', result.id))
      });
    }
  };

  // ---- RENDER LOADING/ERROR (Edit Mode) ----
  if (isEditMode && isLoadingTrial) {
    return <Loading text="Đang tải dữ liệu khách hàng..." className="py-20" />;
  }

  if (isEditMode && (error || !trial)) {
    return (
      <div className="p-6">
        <EmptyState 
          title="Không tìm thấy dữ liệu" 
          description="Khách hàng không tồn tại hoặc đã bị xóa khỏi hệ thống." 
        />
        <div className="flex justify-center mt-4">
          <button onClick={() => navigate(RoutePaths.TRIALS)} className="text-blue-600 hover:underline text-sm font-medium">
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* ---- HEADER & BACK ---- */}
      <div className="flex flex-col gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors w-fit"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Quay lại
        </button>
        
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Cập nhật thông tin học thử' : 'Thêm khách hàng tiềm năng mới'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isEditMode 
              ? `Chỉnh sửa thông tin cho lead: ${trial?.fullName}` 
              : 'Điền thông tin để tạo mới một khách hàng tiềm năng tham gia học thử.'}
          </p>
        </div>
      </div>

      {/* ---- FORM COMPONENT ---- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <TrialForm
          mode={isEditMode ? 'edit' : 'create'}
          defaultValues={trial ? {
            fullName: trial.fullName,
            phone: trial.phone,
            email: trial.email ?? undefined,
            source: trial.source ?? undefined,
            note: trial.note ?? undefined,
            status: trial.status,
          } : undefined}
          onSubmit={handleSubmit}
          isLoading={isCreating || isUpdating}
        />
      </div>
    </div>
  );
};

export default TrialFormPage;
