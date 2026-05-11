import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/shared/ui/modal';
import { FormInput } from '@/shared/ui/form/form-input';
import { FormField } from '@/shared/ui/form/form-field';
import { Button } from '@/shared/ui/button';
import { formatDate } from '@/shared/lib/date';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { getSessionConflictCheck } from '@/infrastructure/services/sessions.api';
import { QUERY_KEYS } from '@/infrastructure/query/query-keys';
import { parseConflictCheck } from '@/infrastructure/services/session-parse.util';
import { cn } from '@/shared/lib/cn';

const schema = z.object({
  newDate: z.string().min(1, 'Chọn ngày'),
  reason: z.string().min(10, 'Lý do tối thiểu 10 ký tự'),
});

export type RescheduleFormValues = z.infer<typeof schema>;

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  originalDate: string;
  onSubmit: (values: RescheduleFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
}

export function RescheduleModal({
  isOpen,
  onClose,
  sessionId,
  originalDate,
  onSubmit,
  isSubmitting = false,
}: RescheduleModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<RescheduleFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { newDate: '', reason: '' },
  });

  const newDateVal = watch('newDate');
  const debouncedDate = useDebounce(newDateVal, 500);

  const conflictQ = useQuery({
    queryKey: QUERY_KEYS.SESSIONS.conflictCheck(sessionId, debouncedDate),
    queryFn: () => getSessionConflictCheck(sessionId, debouncedDate),
    enabled:
      Boolean(isOpen && sessionId && debouncedDate && debouncedDate.length === 10 && debouncedDate !== originalDate.slice(0, 10)),
    select: (data: unknown) => parseConflictCheck(data),
  });

  useEffect(() => {
    if (isOpen) reset({ newDate: '', reason: '' });
  }, [isOpen, reset]);

  const close = () => {
    reset();
    onClose();
  };

  const conflict = conflictQ.data?.conflict;
  const conflictMsg = conflictQ.data?.message;

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title="Dời lịch buổi học"
      maxWidth="md"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={close} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            type="submit"
            form="reschedule-form"
            isLoading={isSubmitting}
            disabled={Boolean(conflict)}
          >
            Lưu
          </Button>
        </>
      }
    >
      <div className="mb-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-sm">
        <span className="text-[var(--text-muted)]">Ngày gốc: </span>
        <span className="line-through decoration-[var(--text-muted)] decoration-2">{formatDate(originalDate)}</span>
      </div>
      <form
        id="reschedule-form"
        className="space-y-4"
        onSubmit={handleSubmit(async (v) => {
          try {
            await onSubmit(v);
            close();
          } catch {
            /* toast từ caller */
          }
        })}
      >
        <FormInput type="date" label="Ngày mới" {...register('newDate')} error={errors.newDate?.message} />
        {conflictQ.isFetching && debouncedDate ? (
          <p className="text-xs text-[var(--text-muted)]">Đang kiểm tra trùng lịch…</p>
        ) : null}
        {conflict ? (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
            {conflictMsg ?? 'GV/Phòng trùng lịch với buổi khác.'}
          </div>
        ) : null}
        <FormField label="Lý do (≥ 10 ký tự)" htmlFor="reschedule-reason" required error={errors.reason?.message}>
          <textarea
            id="reschedule-reason"
            rows={3}
            className={cn(
              'min-h-[88px] w-full resize-y rounded-lg border border-[var(--border-default)] bg-[var(--bg-subtle)] px-3 py-2 text-sm text-[var(--text-primary)]',
              'outline-none focus:border-brand-500 focus:shadow-[0_0_0_3px_rgba(108,99,255,0.2)]',
            )}
            {...register('reason')}
          />
        </FormField>
      </form>
    </Modal>
  );
}
