import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertTriangle } from 'lucide-react';
import { Modal } from '@/shared/ui/modal';
import { Button } from '@/shared/ui/button';
import { FormInput } from '@/shared/ui/form/form-input';
import { FormSelect } from '@/shared/ui/form/form-select';
import { EARLY_DROP_REASON_ENTRIES, SUBJECTIVE_DROP_REASON_ENTRIES } from '@/shared/constants/student-drop';

const dropSchema = z.object({
  reasonType: z.string().min(1, 'Chọn loại lý do'),
  detail: z.string().min(1, 'Nhập chi tiết lý do'),
  confirmName: z.string().min(1, 'Nhập đúng tên học viên để xác nhận'),
});

export type DropFormValues = z.infer<typeof dropSchema>;

interface DropModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionsAttended: number;
  studentFullName: string;
  onSubmit: (body: Record<string, unknown>) => void | Promise<void>;
  isSubmitting?: boolean;
}

export function DropModal({
  isOpen,
  onClose,
  sessionsAttended,
  studentFullName,
  onSubmit,
  isSubmitting = false,
}: DropModalProps) {
  const lateDrop = sessionsAttended >= 3;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<DropFormValues>({
    resolver: zodResolver(dropSchema),
    defaultValues: { reasonType: '', detail: '', confirmName: '' },
  });

  useEffect(() => {
    if (isOpen) reset({ reasonType: '', detail: '', confirmName: '' });
  }, [isOpen, reset]);

  const reasonType = watch('reasonType');
  const confirmName = watch('confirmName');
  const nameOk =
    studentFullName.trim().length > 0 &&
    confirmName.trim().toLowerCase() === studentFullName.trim().toLowerCase();

  const close = () => {
    reset();
    onClose();
  };

  const typeOptions = useMemo(() => {
    const entries = lateDrop ? SUBJECTIVE_DROP_REASON_ENTRIES : EARLY_DROP_REASON_ENTRIES;
    return [{ value: '', label: 'Chọn loại lý do' }, ...entries.map(([key, label]) => ({ value: key, label }))];
  }, [lateDrop]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title="Bỏ học"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={close} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button type="submit" form="drop-enrollment-form" variant="danger" isLoading={isSubmitting} disabled={!nameOk}>
            Xác nhận bỏ học
          </Button>
        </>
      }
    >
      <div className="mb-4 flex gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-3 text-sm text-red-200">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-400" aria-hidden />
        <div>
          <p className="font-semibold">Hành động này không thể hoàn tác</p>
          <p className="mt-1 text-red-200/90">Ghi danh sẽ được đánh dấu nghỉ và không tự khôi phục.</p>
        </div>
      </div>

      {lateDrop ? (
        <p className="mb-3 text-sm text-amber-300">Đã học từ 3 buổi: chọn lý do chủ quan (subjective_*) và mô tả chi tiết.</p>
      ) : (
        <p className="mb-3 text-sm text-[var(--text-secondary)]">
          Dưới 3 buổi: chọn lý do (trung tâm không mở lớp hoặc lý do chủ quan).
        </p>
      )}
      <form
        id="drop-enrollment-form"
        onSubmit={handleSubmit((v) => {
          if (v.confirmName.trim().toLowerCase() !== studentFullName.trim().toLowerCase()) return;
          return onSubmit({
            reasonType: v.reasonType,
            reasonDetail: v.detail,
          });
        })}
      >
        <FormSelect
          label="Loại lý do"
          options={typeOptions}
          {...register('reasonType')}
          error={errors.reasonType?.message}
        />
        {reasonType === 'subjective_class_transfer' ? (
          <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200/95">
            Sau khi xác nhận, tạo <strong>ghi danh mới</strong> cho học viên ở lớp đích (cùng chương
            trình). Nếu còn trong 3 buổi đầu và ghi danh đang <strong>active</strong>, ưu tiên nút{' '}
            <strong>↔ Chuyển lớp</strong> để giữ nguyên ghi danh và học phí.
          </p>
        ) : null}
        <div className="mt-3">
          <FormInput
            label="Chi tiết lý do"
            {...register('detail')}
            error={errors.detail?.message}
            placeholder="Mô tả cụ thể"
          />
        </div>
        <div className="mt-4 border-t border-[var(--border-subtle)] pt-3">
          <p className="mb-2 text-xs text-[var(--text-muted)]">
            Gõ đúng họ tên học viên để mở khóa: <span className="font-medium text-[var(--text-secondary)]">{studentFullName}</span>
          </p>
          <FormInput
            label="Xác nhận tên học viên"
            {...register('confirmName')}
            error={errors.confirmName?.message}
            placeholder={studentFullName}
            autoComplete="off"
          />
        </div>
      </form>
    </Modal>
  );
}
