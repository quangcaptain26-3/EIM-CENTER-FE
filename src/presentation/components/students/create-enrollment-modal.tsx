import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createEnrollmentFormSchema, type CreateEnrollmentFormValues, defaultCreateEnrollmentFormValues } from '@/application/students/forms/enrollment.form';
import { useCreateEnrollment } from '@/presentation/hooks/students/use-enrollment-mutations';
import { useClasses } from '@/presentation/hooks/classes/use-classes';
import { Modal } from '@/shared/ui/modal';
import { FormInput } from '@/shared/ui/form/form-input';
import { FormSelect } from '@/shared/ui/form/form-select';
import { Button } from '@/shared/ui/button';

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
  const { data: classesData } = useClasses({ status: 'ACTIVE', limit: 100 });

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
    const payload = {
      ...data,
      classId: data.classId?.trim() || null,
    };
    createEnrollment(payload, {
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
        {/* Chọn lớp từ danh sách — không cần nhập UUID */}
        <FormSelect
          label="Mã lớp học"
          {...register('classId')}
          error={errors.classId?.message}
          options={[
            { label: '--- Chưa xếp lớp (tạo ghi danh chờ xếp) ---', value: '' },
            ...(classesData?.items ?? []).map((c) => ({
              label: `${c.code} - ${c.name ?? ''}`,
              value: c.id,
            })),
          ]}
          disabled={!classesData}
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
