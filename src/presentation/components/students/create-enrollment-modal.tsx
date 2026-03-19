import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createEnrollmentFormSchema, type CreateEnrollmentFormValues, defaultCreateEnrollmentFormValues } from '@/application/students/forms/enrollment.form';
import { useCreateEnrollment } from '@/presentation/hooks/students/use-enrollment-mutations';
import { Modal } from '@/shared/ui/modal';
import { FormInput } from '@/shared/ui/form/form-input';
import { Button } from '@/shared/ui/button';
import { useEffect } from 'react';

export interface CreateEnrollmentModalProps {
  open: boolean;
  onClose: () => void;
  studentId: string;
}

/**
 * Modal dùng để đăng ký học viên vào một lớp mới
 */
export const CreateEnrollmentModal = ({ open, onClose, studentId }: CreateEnrollmentModalProps) => {
  const { mutate: createEnrollment, isPending } = useCreateEnrollment(studentId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateEnrollmentFormValues>({
    resolver: zodResolver(createEnrollmentFormSchema),
    defaultValues: { ...defaultCreateEnrollmentFormValues, studentId },
  });

  // Reset form everytime modal opens
  useEffect(() => {
    if (open) {
      reset({ ...defaultCreateEnrollmentFormValues, studentId });
    }
  }, [open, reset, studentId]);

  const onSubmit = (data: CreateEnrollmentFormValues) => {
    createEnrollment(data, {
      onSuccess: () => onClose(), // Đóng pop-up khi thành công
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Đăng ký khóa học mới"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Hủy
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isPending}>
            Xác nhận
          </Button>
        </>
      }
    >
      <form id="create-enrollment-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* TODO: Sau này làm select autocomplete để gõ/chọn tên lớp. Tạm thời nhập tay classId */}
        <FormInput
          label="Mã lớp học (Class ID)"
          placeholder="Nhập ID lớp..."
          error={errors.classId?.message}
          required
          {...register('classId')}
        />

        <FormInput
          label="Ngày bắt đầu học"
          type="date"
          error={errors.startDate?.message}
          required
          {...register('startDate')}
        />
      </form>
    </Modal>
  );
};
