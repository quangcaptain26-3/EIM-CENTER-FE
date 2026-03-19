import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transferEnrollmentFormSchema, type TransferEnrollmentFormValues } from '@/application/students/forms/enrollment.form';
import { useTransferEnrollment } from '@/presentation/hooks/students/use-enrollment-mutations';
import type { EnrollmentModel } from '@/domain/students/models/enrollment.model';
import { Modal } from '@/shared/ui/modal';
import { FormInput } from '@/shared/ui/form/form-input';
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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TransferEnrollmentFormValues>({
    resolver: zodResolver(transferEnrollmentFormSchema),
    defaultValues: { toClassId: '', note: '' },
  });

  useEffect(() => {
    if (open) {
      reset({ toClassId: '', note: '' });
    }
  }, [open, reset]);

  const onSubmit = (data: TransferEnrollmentFormValues) => {
    if (!enrollment) return;
    transfer(
      { enrollmentId: enrollment.id, payload: data },
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
        Đang cấu hình chuyển học viên khỏi lớp cũ <strong>{enrollment?.classId.substring(0,8)}...</strong>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* TODO: Upgrade bằng Select Autocomplete khi có list Class API */}
        <FormInput
          label="Mã lớp mới (To Class ID)"
          placeholder="Nhập chính xác ID lớp chuyển sang..."
          error={errors.toClassId?.message}
          required
          {...register('toClassId')}
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
