import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check } from 'lucide-react';
import { getAvailableCovers } from '@/infrastructure/services/sessions.api';
import { QUERY_KEYS } from '@/infrastructure/query/query-keys';
import { parseAvailableCovers } from '@/infrastructure/services/session-parse.util';
import { Modal } from '@/shared/ui/modal';
import { FormField } from '@/shared/ui/form/form-field';
import { Button } from '@/shared/ui/button';
import { formatDate } from '@/shared/lib/date';
import { cn } from '@/shared/lib/cn';
import { Tooltip } from '@/shared/ui/tooltip';
import type { AvailableCoverTeacher } from '@/shared/types/session.type';

const schema = z.object({
  teacherId: z.string().min(1, 'Chọn giáo viên'),
  teacherName: z.string().optional(),
  reason: z.string().min(1, 'Nhập lý do'),
});

export type CoverFormValues = z.infer<typeof schema>;

interface CoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  classCode?: string;
  scheduledDate: string;
  shiftLabel?: string;
  onSubmit: (values: CoverFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
}

export function CoverModal({
  isOpen,
  onClose,
  sessionId,
  classCode,
  scheduledDate,
  shiftLabel,
  onSubmit,
  isSubmitting = false,
}: CoverModalProps) {
  const coversQuery = useQuery({
    queryKey: QUERY_KEYS.SESSIONS.availableCovers(sessionId),
    queryFn: () => getAvailableCovers(sessionId),
    enabled: isOpen && Boolean(sessionId),
  });

  const teachers = coversQuery.data ? parseAvailableCovers(coversQuery.data) : [];

  const sortedTeachers = useMemo(() => {
    const av: AvailableCoverTeacher[] = [];
    const un: AvailableCoverTeacher[] = [];
    for (const t of teachers) {
      const bad = t.isConflict === true || t.isAvailable === false;
      if (bad) un.push(t);
      else av.push(t);
    }
    return [...av, ...un];
  }, [teachers]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CoverFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { teacherId: '', teacherName: '', reason: '' },
  });

  useEffect(() => {
    if (isOpen) reset({ teacherId: '', teacherName: '', reason: '' });
  }, [isOpen, reset]);

  const pickedId = watch('teacherId');
  const picked = teachers.find((t) => t.userId === pickedId);
  const pickedUnavailable = picked?.isConflict === true || picked?.isAvailable === false;

  const close = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title="Gán giáo viên dạy thay"
      maxWidth="lg"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={close} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            type="submit"
            form="cover-form"
            isLoading={isSubmitting}
            disabled={pickedUnavailable}
          >
            Xác nhận
          </Button>
        </>
      }
    >
      <div className="mb-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-3 text-sm text-[var(--text-secondary)]">
        <p>
          <span className="text-[var(--text-muted)]">Lớp: </span>
          {classCode ?? '—'}
        </p>
        <p className="mt-1">
          <span className="text-[var(--text-muted)]">Ngày: </span>
          {formatDate(scheduledDate)}
          {shiftLabel ? (
            <>
              <span className="text-[var(--text-muted)]"> · </span>
              {shiftLabel}
            </>
          ) : null}
        </p>
      </div>

      {coversQuery.isLoading ? (
        <p className="text-sm text-[var(--text-muted)]">Đang tải danh sách GV…</p>
      ) : (
        <form
          id="cover-form"
          className="space-y-4"
          onSubmit={handleSubmit(async (v) => {
            try {
              await onSubmit(v);
              close();
            } catch {
              /* mutation / toast ở caller */
            }
          })}
        >
          <input type="hidden" {...register('teacherId')} />
          <input type="hidden" {...register('teacherName')} />

          <div className="grid max-h-[min(420px,60vh)] gap-3 overflow-y-auto sm:grid-cols-2">
            {sortedTeachers.length === 0 ? (
              <p className="col-span-full text-sm text-[var(--text-muted)]">Không có giáo viên nào.</p>
            ) : (
              sortedTeachers.map((t) => {
                const unavailable = t.isConflict === true || t.isAvailable === false;
                const active = pickedId === t.userId && !unavailable;
                const tooltipText = unavailable
                  ? `Trùng lịch: ${t.conflictReason ?? 'Không khả dụng'}`
                  : '';

                if (unavailable) {
                  return (
                    <Tooltip key={t.userId} content={tooltipText}>
                      <div
                        className={cn(
                          'relative w-full cursor-not-allowed rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/20 px-3 py-2.5 text-left text-sm opacity-50',
                        )}
                      >
                        <span className="block font-medium text-[var(--text-secondary)]">{t.fullName}</span>
                        {t.conflictReason ? (
                          <span className="mt-1 block text-xs text-[var(--text-muted)] line-clamp-2">{t.conflictReason}</span>
                        ) : null}
                      </div>
                    </Tooltip>
                  );
                }

                return (
                  <button
                    key={t.userId}
                    type="button"
                    onClick={() => {
                      setValue('teacherId', t.userId, { shouldValidate: true });
                      setValue('teacherName', t.fullName, { shouldValidate: true });
                    }}
                    className={cn(
                      'relative w-full rounded-xl border px-3 py-2.5 text-left text-sm transition-colors',
                      !active && 'border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:border-brand-500',
                      active && 'border-brand-500 bg-brand-500/5 text-[var(--text-primary)]',
                    )}
                  >
                    {active ? (
                      <span className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-brand-500 text-white">
                        <Check className="size-3.5 stroke-3" />
                      </span>
                    ) : null}
                    <span className="block pr-8 font-medium">{t.fullName}</span>
                  </button>
                );
              })
            )}
          </div>
          {errors.teacherId ? <p className="text-sm text-red-400">{errors.teacherId.message}</p> : null}

          <FormField label="Lý do" htmlFor="cover-reason" required error={errors.reason?.message}>
            <textarea
              id="cover-reason"
              rows={3}
              className="min-h-[80px] w-full resize-y rounded-lg border border-[var(--border-default)] bg-[var(--bg-subtle)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-brand-500"
              {...register('reason')}
            />
          </FormField>
        </form>
      )}
    </Modal>
  );
}
