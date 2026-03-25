import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateEnrollmentStatusFormSchema, type UpdateEnrollmentStatusFormValues } from '@/application/students/forms/enrollment.form';
import { useUpdateEnrollmentStatus } from '@/presentation/hooks/students/use-enrollment-mutations';
import type { EnrollmentModel, EnrollmentStatus } from '@/domain/students/models/enrollment.model';
import { ENROLLMENT_STATUS_OPTIONS } from '@/shared/constants/enrollment-status';
import { Modal } from '@/shared/ui/modal';
import { FormSelect } from '@/shared/ui/form/form-select';
import { FormInput } from '@/shared/ui/form/form-input';
import { Button } from '@/shared/ui/button';

export interface UpdateEnrollmentStatusModalProps {
  open: boolean;
  onClose: () => void;
  enrollment: EnrollmentModel | null;
  studentId: string;
}

/**
 * Modal cập nhật trạng thái của học viên trong lớp (bảo lưu, thôi học, tốt nghiệp)
 */
export const UpdateEnrollmentStatusModal = ({ open, onClose, enrollment, studentId }: UpdateEnrollmentStatusModalProps) => {
  const { mutate: updateStatus, isPending } = useUpdateEnrollmentStatus(studentId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateEnrollmentStatusFormValues>({
    resolver: zodResolver(updateEnrollmentStatusFormSchema),
    defaultValues: { status: 'ACTIVE', note: '' },
  });

  useEffect(() => {
    if (open && enrollment) {
      reset({ status: enrollment.status, note: '' });
    }
  }, [open, enrollment, reset]);

  const onSubmit = (data: UpdateEnrollmentStatusFormValues) => {
    if (!enrollment) return;
    updateStatus(
      { enrollmentId: enrollment.id, payload: { ...data, status: data.status as EnrollmentStatus } },
      { onSuccess: () => onClose() }
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Cập nhật trạng thái"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isPending}>Hủy</Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isPending}>Lưu thay đổi</Button>
        </>
      }
    >
      <div className="mb-4 p-3 bg-blue-50 text-blue-800 rounded-md text-sm border border-blue-100">
        Bạn đang cập nhật trạng thái cho lớp <strong>{enrollment?.classCode ?? enrollment?.classId?.slice(0, 8) ?? '—'}...</strong>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormSelect
          label="Trạng thái"
          error={errors.status?.message}
          required
          options={Object.entries(ENROLLMENT_STATUS_OPTIONS).map(([val, label]) => ({
            label,
            value: val,
          }))}
          {...register('status')}
        />

        <FormInput
          label="Ghi chú (Tùy chọn)"
          placeholder="Lý do cập nhật..."
          error={errors.note?.message}
          {...register('note')}
        />
      </form>
    </Modal>
  );
};
