import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/shared/ui/modal';
import { FormInput } from '@/shared/ui/form/form-input';
import { FormField } from '@/shared/ui/form/form-field';
import { Button } from '@/shared/ui/button';
import { fmt } from '@/shared/lib/fmt';

const salarySchema = z.object({
  salaryPerSession: z.number().min(0, 'Không âm'),
  reason: z.string().min(10, 'Lý do ít nhất 10 ký tự'),
});

export type SalaryFormValues = z.infer<typeof salarySchema>;

interface SalaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSalaryPerSession?: number | null;
  initialAllowance?: number | null;
  onSubmit: (values: SalaryFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
}

export function SalaryModal({
  isOpen,
  onClose,
  initialSalaryPerSession,
  initialAllowance,
  onSubmit,
  isSubmitting = false,
}: SalaryModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SalaryFormValues>({
    resolver: zodResolver(salarySchema),
    defaultValues: {
      salaryPerSession: initialSalaryPerSession ?? 0,
      reason: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        salaryPerSession: initialSalaryPerSession ?? 0,
        reason: '',
      });
    }
  }, [isOpen, initialSalaryPerSession, initialAllowance, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Điều chỉnh lương"
      maxWidth="md"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={handleClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button type="submit" form="salary-form" isLoading={isSubmitting}>
            Lưu
          </Button>
        </>
      }
    >
      <form
        id="salary-form"
        onSubmit={handleSubmit(async (values) => {
          try {
            await onSubmit(values);
            handleClose();
          } catch {
            /* lỗi đã toast từ mutation */
          }
        })}
        className="space-y-4"
      >
        <div className="rounded-xl border border-brand-500/25 bg-brand-500/5 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">Hiện tại</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <div>
              <p className="text-xs text-[var(--text-muted)]">Lương / buổi</p>
              <p className="font-display text-lg font-semibold text-[var(--text-primary)]">
                {fmt.currencyShort(initialSalaryPerSession ?? null)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Phụ cấp</p>
              <p className="font-display text-lg font-semibold text-[var(--text-primary)]">
                {fmt.currencyShort(initialAllowance ?? null)}
              </p>
            </div>
          </div>
        </div>

        <FormInput
          label="Lương / buổi (mới)"
          type="number"
          step="1"
          {...register('salaryPerSession', { valueAsNumber: true })}
          error={errors.salaryPerSession?.message}
        />
        <FormField label="Lý do điều chỉnh" htmlFor="salary-reason" required error={errors.reason?.message}>
          <textarea
            id="salary-reason"
            rows={3}
            className="min-h-[88px] w-full resize-y rounded-lg border border-[var(--border-default)] bg-[var(--bg-subtle)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-brand-500 focus:shadow-[0_0_0_3px_rgba(108,99,255,0.2)]"
            placeholder="Tối thiểu 10 ký tự…"
            {...register('reason')}
          />
        </FormField>
      </form>
    </Modal>
  );
}
