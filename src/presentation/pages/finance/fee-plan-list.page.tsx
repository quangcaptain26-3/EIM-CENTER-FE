import { useState } from 'react';
import { PageShell } from '@/presentation/components/common/page-shell';
import { useFeePlans } from '@/presentation/hooks/finance/use-finance';
import { useCreateFeePlan, useUpdateFeePlan } from '@/presentation/hooks/finance/use-finance-mutations';
import { usePrograms } from '@/presentation/hooks/curriculum/use-programs';
import { useFinancePermission } from '@/presentation/hooks/finance/use-finance-permission';
import type { FeePlanModel } from '@/domain/finance/models/fee-plan.model';
import { formatVND } from '@/shared/lib/currency';
import { Loading } from '@/shared/ui/feedback/loading';
import { Modal } from '@/shared/ui/modal';
import { FormInput } from '@/shared/ui/form/form-input';
import { FormSelect } from '@/shared/ui/form/form-select';
import { useForm } from 'react-hook-form';
import { Plus, Edit2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';

export default function FeePlanListPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const { hasWriteAccess } = useFinancePermission();

  const { data: feePlans, isLoading } = useFeePlans() as { data: FeePlanModel[] | undefined, isLoading: boolean };
  const { data: programs } = usePrograms();
  const { mutate: createPlan, isPending: isCreating } = useCreateFeePlan();
  const { mutate: updatePlan, isPending: isUpdating } = useUpdateFeePlan();

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const handleOpenModal = (plan: FeePlanModel | null = null) => {
    setEditingPlan(plan);
    if (plan) {
      reset({
        name: plan.programName,
        amount: plan.amount,
        programId: plan.programId,
      });
    } else {
      reset({ name: '', amount: 0, programId: '' });
    }
    setIsModalOpen(true);
  };

  const onSubmit = (data: any) => {
    if (editingPlan) {
      updatePlan({ id: editingPlan.id, dto: data }, {
        onSuccess: () => {
          setIsModalOpen(false);
          setEditingPlan(null);
        }
      });
    } else {
      createPlan(data, {
        onSuccess: () => {
          setIsModalOpen(false);
        }
      });
    }
  };

  if (isLoading) return <Loading text="Đang tải danh sách gói phí..." className="py-20" />;

  return (
    <PageShell
      title="Quản lý Gói học phí"
      description="Cấu hình mức học phí cho từng chương trình đào tạo."
      actions={
        hasWriteAccess && (
          <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Thêm gói học phí
          </Button>
        )
      }
    >
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-700">Tên chương trình</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Mức học phí</th>
              <th className="px-6 py-4 font-semibold text-slate-700 text-center">Trạng thái</th>
              <th className="px-6 py-4 font-semibold text-slate-700 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {feePlans?.map((plan: FeePlanModel) => (
              <tr key={plan.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900">{plan.programName}</div>
                  <div className="text-xs text-slate-400 mt-0.5">ID: {plan.id}</div>
                </td>
                <td className="px-6 py-4 font-mono font-medium text-blue-600">
                  {formatVND(plan.amount)}
                </td>
                <td className="px-6 py-4 text-center">
                  <Badge variant={plan.active ? 'success' : 'default'} className="inline-flex items-center gap-1">
                    {plan.active ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" /> Hiệu lực
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" /> Vô hiệu
                      </>
                    )}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right">
                  {hasWriteAccess && (
                    <button 
                      onClick={() => handleOpenModal(plan)}
                      className="text-slate-400 hover:text-blue-600 p-2 transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPlan ? "Cập nhật gói học phí" : "Thêm gói học phí mới"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormSelect
            label="Chương trình đào tạo"
            options={programs?.map((p: any) => ({ label: p.name, value: p.id })) || []}
            {...register('programId', { required: 'Vui lòng chọn chương trình' })}
            error={errors.programId?.message as string}
          />
          <FormInput
            label="Tên hiển thị"
            placeholder="Ví dụ: Tiếng Anh Tiểu học - Đợt 1"
            {...register('name', { required: 'Vui lòng nhập tên gói' })}
            error={errors.name?.message as string}
          />
          <FormInput
            label="Số tiền (VND)"
            type="number"
            {...register('amount', { required: 'Vui lòng nhập số tiền', valueAsNumber: true })}
            error={errors.amount?.message as string}
          />
          
          <div className="pt-2">
            <Button type="submit" className="w-full" loading={isCreating || isUpdating}>
              {editingPlan ? "Lưu thay đổi" : "Tạo gói học phí"}
            </Button>
          </div>
        </form>
      </Modal>
    </PageShell>
  );
}
