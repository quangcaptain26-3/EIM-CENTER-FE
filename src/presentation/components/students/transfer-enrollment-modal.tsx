import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transferEnrollmentFormSchema, type TransferEnrollmentFormValues } from '@/application/students/forms/enrollment.form';
import { useTransferEnrollment } from '@/presentation/hooks/students/use-enrollment-mutations';
import { useClasses } from '@/presentation/hooks/classes/use-classes';
import type { EnrollmentModel } from '@/domain/students/models/enrollment.model';
import { Modal } from '@/shared/ui/modal';
import { FormInput } from '@/shared/ui/form/form-input';
import { FormSelect } from '@/shared/ui/form/form-select';
import { Button } from '@/shared/ui/button';

export interface TransferEnrollmentModalProps {
  open: boolean;
  onClose: () => void;
  enrollment: EnrollmentModel | null;
  studentId: string;
}

/**
 * Modal chuyển học viên sang lớp khác
 */
export const TransferEnrollmentModal = ({ open, onClose, enrollment, studentId }: TransferEnrollmentModalProps) => {
  const { mutate: transfer, isPending } = useTransferEnrollment(studentId);
  // Chỉ hiện lớp cùng chương trình và còn chỗ (remaining_capacity > 0)
  const { data: classesData } = useClasses({
    status: 'ACTIVE',
    programId: enrollment?.programId ?? undefined,
    limit: 100,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TransferEnrollmentFormValues>({
    resolver: zodResolver(transferEnrollmentFormSchema),
    defaultValues: { toClassId: '', effectiveDate: '', note: '' },
  });

  useEffect(() => {
    if (open) {
      reset({ toClassId: '', effectiveDate: undefined, note: '' });
    }
  }, [open, reset]);

  const onSubmit = (data: TransferEnrollmentFormValues) => {
    if (!enrollment) return;
    const payload = {
      toClassId: data.toClassId,
      effectiveDate: data.effectiveDate?.trim() || undefined,
      note: data.note?.trim() || undefined,
    };
    transfer(
      { enrollmentId: enrollment.id, payload },
      { onSuccess: () => onClose() }
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Quyết định Chuyển lớp"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isPending}>Hủy</Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isPending}>Xác nhận chuyển</Button>
        </>
      }
    >
      <div className="mb-4 p-3 bg-orange-50 text-orange-800 rounded-md text-sm border border-orange-100">
        Đang chuyển học viên khỏi lớp <strong>{enrollment?.classCode ?? enrollment?.classId?.slice(0, 8) ?? '—'}...</strong>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Chọn lớp đích từ danh sách — không cần nhập UUID */}
        <FormSelect
          label="Mã lớp đích"
          required
          {...register('toClassId')}
          error={errors.toClassId?.message}
          options={(classesData?.items ?? [])
            .filter((c) => c.id !== enrollment?.classId) // Loại lớp hiện tại
            .filter((c) => {
              const currentSize = c.currentSize ?? 0;
              const remaining = (c.capacity ?? 0) - currentSize;
              return remaining > 0; // Chỉ hiện lớp còn chỗ
            })
            .map((c) => ({
              label: `${c.code} - ${c.name ?? ''} (còn ${(c.capacity ?? 0) - (c.currentSize ?? 0)} chỗ)`,
              value: c.id,
            }))}
          disabled={!classesData}
        />

        <FormInput
          label="Ngày hiệu lực (Tùy chọn)"
          type="date"
          placeholder="YYYY-MM-DD — để trống = hôm nay"
          error={errors.effectiveDate?.message}
          {...register('effectiveDate')}
        />

        <FormInput
          label="Ghi chú / QĐ Số (Tùy chọn)"
          placeholder="Lý do chuyển, số QĐ,..."
          error={errors.note?.message}
          {...register('note')}
        />
      </form>
    </Modal>
  );
};
