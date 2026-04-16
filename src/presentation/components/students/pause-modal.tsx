import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/shared/ui/modal';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form/form-field';
import { cn } from '@/shared/lib/cn';

const schema = z.object({
  reason: z
    .string()
    .min(20, 'Lý do cần ít nhất 20 ký tự')
    .max(2000, 'Quá dài'),
});

export type PauseFormValues = z.infer<typeof schema>;

interface PauseModalProps {
  isOpen: boolean;
  onClose: () => void;
  classLabel?: string | null;
  sessionsAttended: number;
  onSubmit: (values: PauseFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
}

export function PauseModal({
  isOpen,
  onClose,
  classLabel,
  sessionsAttended,
  onSubmit,
  isSubmitting = false,
}: PauseModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PauseFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { reason: '' },
  });

  useEffect(() => {
    if (isOpen) reset({ reason: '' });
  }, [isOpen, reset]);

  const close = () => {
    reset();
    onClose();
  };

  const freePhase = sessionsAttended < 3;

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title="Bảo lưu / tạm dừng học"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={close} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button type="submit" form="pause-enrollment-form" isLoading={isSubmitting}>
            Gửi yêu cầu
          </Button>
        </>
      }
    >
      <div className="mb-4 rounded-lg border border-[var(--border-default)] bg-[var(--bg-subtle)] px-3 py-2 text-sm text-[var(--text-secondary)]">
        <p>
          <span className="text-[var(--text-muted)]">Lớp:</span> {classLabel ?? '—'}
        </p>
        <p className="mt-0.5">
          <span className="text-[var(--text-muted)]">Buổi đã học (tích lũy):</span> {sessionsAttended}
        </p>
      </div>

      {freePhase ? (
        <div
          className={cn(
            'mb-4 rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-3 py-3 text-sm text-emerald-100',
          )}
        >
          <p className="font-medium text-emerald-50">
            Giai đoạn tự do (đã học {sessionsAttended}/3 buổi)
          </p>
          <p className="mt-1.5 text-emerald-100/95">Bảo lưu sẽ được áp dụng ngay, không cần duyệt.</p>
          <p className="mt-1 text-emerald-200/90">Học phí được bảo lưu 100%.</p>
        </div>
      ) : (
        <div
          className={cn(
            'mb-4 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-3 text-sm text-amber-100',
          )}
        >
          <p className="font-medium text-amber-50">
            Đã học {sessionsAttended} buổi — cần duyệt từ Giám đốc
          </p>
          <p className="mt-1.5 text-amber-100/95">
            Yêu cầu sẽ ở trạng thái Chờ duyệt cho đến khi Giám đốc xem xét.
          </p>
        </div>
      )}

      <form id="pause-enrollment-form" onSubmit={handleSubmit((v) => onSubmit(v))}>
        <FormField
          label="Lý do bảo lưu"
          htmlFor="pause-reason"
          required
          error={errors.reason?.message}
          helpText="Tối thiểu 20 ký tự."
        >
          <textarea
            id="pause-reason"
            rows={4}
            placeholder="Ví dụ: Gia đình có việc đột xuất cần về quê 2 tháng, xin bảo lưu để giữ suất và học phí…"
            className={cn(
              'w-full resize-y rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)]',
              'placeholder:text-[var(--text-muted)] focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/40',
            )}
            {...register('reason')}
          />
        </FormField>
      </form>
    </Modal>
  );
}
