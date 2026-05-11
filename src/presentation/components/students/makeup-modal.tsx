import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Modal } from '@/shared/ui/modal';
import { Button } from '@/shared/ui/button';
import { FormInput } from '@/shared/ui/form/form-input';
import { FormSelect } from '@/shared/ui/form/form-select';
import { useParsedRooms } from '@/presentation/hooks/classes/use-classes';
import { useUsers } from '@/presentation/hooks/system/use-users';
import { ROLES } from '@/shared/constants/roles';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { previewMakeupConflict } from '@/infrastructure/services/students.api';

const schema = z.object({
  attendanceId: z.string().min(1, 'Chọn buổi vắng có phép'),
  makeupDate: z.string().min(1, 'Chọn ngày'),
  shift: z.enum(['1', '2']),
  roomId: z.string().min(1, 'Chọn phòng'),
  teacherId: z.string().min(1, 'Chọn giáo viên'),
  note: z.string().optional(),
});

export type MakeupFormValues = z.infer<typeof schema>;

export interface MakeupAttendanceOption {
  id: string;
  label: string;
}

interface MakeupModalProps {
  isOpen: boolean;
  onClose: () => void;
  makeupBlocked?: boolean;
  makeupBlockedReason?: string | null;
  eligibleAttendances: MakeupAttendanceOption[];
  /** Chọn sẵn buổi điểm danh (khi mở từ dòng lịch sử) */
  initialAttendanceId?: string | null;
  onSubmit: (data: Record<string, unknown>) => void | Promise<void>;
  isSubmitting?: boolean;
}

export function MakeupModal({
  isOpen,
  onClose,
  makeupBlocked,
  makeupBlockedReason,
  eligibleAttendances,
  initialAttendanceId,
  onSubmit,
  isSubmitting = false,
}: MakeupModalProps) {
  const { rooms, isLoading: roomsLoading } = useParsedRooms();
  const { users: teachers, isLoading: teachersLoading } = useUsers({
    page: 1,
    limit: 200,
    role: ROLES.TEACHER,
    isActive: true,
  });

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) setSubmitError(null);
  }

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<MakeupFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { attendanceId: '', makeupDate: '', shift: '1', roomId: '', teacherId: '', note: '' },
  });

  const makeupDateW = watch('makeupDate');
  const shiftW = watch('shift');
  const roomIdW = watch('roomId');
  const teacherIdW = watch('teacherId');
  const debouncedDate = useDebounce(makeupDateW, 400);
  const debouncedShift = useDebounce(shiftW, 400);
  const debouncedRoom = useDebounce(roomIdW, 400);
  const debouncedTeacher = useDebounce(teacherIdW, 400);

  const conflictQueryEnabled =
    isOpen &&
    !makeupBlocked &&
    Boolean(
      debouncedDate &&
        debouncedRoom &&
        debouncedTeacher &&
        debouncedShift &&
        debouncedDate.length >= 8,
    );

  const { data: conflictPreview, isFetching: conflictLoading } = useQuery({
    queryKey: ['makeup-conflict-preview', debouncedDate, debouncedShift, debouncedRoom, debouncedTeacher],
    queryFn: () =>
      previewMakeupConflict({
        makeupDate: debouncedDate,
        shift: Number(debouncedShift) as 1 | 2,
        roomId: debouncedRoom,
        teacherId: debouncedTeacher,
      }),
    enabled: conflictQueryEnabled,
    staleTime: 0,
  });

  useEffect(() => {
    if (!isOpen) return;
    const pre =
      initialAttendanceId && eligibleAttendances.some((a) => a.id === initialAttendanceId)
        ? initialAttendanceId
        : '';
    reset({
      attendanceId: pre,
      makeupDate: '',
      shift: '1',
      roomId: '',
      teacherId: '',
      note: '',
    });
  }, [isOpen, initialAttendanceId, eligibleAttendances, reset]);

  const close = () => {
    reset();
    setSubmitError(null);
    onClose();
  };

  const attendanceOptions = useMemo(
    () => [
      { value: '', label: 'Chọn buổi vắng có phép (điểm danh)' },
      ...eligibleAttendances.map((a) => ({ value: a.id, label: a.label })),
    ],
    [eligibleAttendances],
  );

  const roomOptions = useMemo(
    () => [
      { value: '', label: 'Chọn phòng' },
      ...rooms.map((r) => ({
        value: r.id,
        label: r.code ? `${r.code}${r.capacity != null ? ` · ${r.capacity} chỗ` : ''}` : r.name,
      })),
    ],
    [rooms],
  );

  const teacherOptions = useMemo(
    () => [
      { value: '', label: 'Chọn GV' },
      ...teachers.map((u) => ({ value: u.id, label: u.fullName })),
    ],
    [teachers],
  );

  const shiftOptions = [
    { value: '1', label: 'Ca 1' },
    { value: '2', label: 'Ca 2' },
  ];

  const canSubmit = eligibleAttendances.length > 0 && !makeupBlocked;

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title="Tạo buổi học bù"
      maxWidth="lg"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={close} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            type="submit"
            form="makeup-session-form"
            isLoading={isSubmitting}
            disabled={!canSubmit}
          >
            Tạo
          </Button>
        </>
      }
    >
      {makeupBlocked && (
        <div className="mb-4 rounded-md border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
          {makeupBlockedReason ??
            'Học bù bị khóa vì đã vắng không phép từ 3 lần trở lên'}
        </div>
      )}
      {eligibleAttendances.length === 0 && !makeupBlocked && (
        <p className="mb-4 text-sm text-[var(--text-secondary)]">
          Không có buổi vắng có phép nào trong lịch sử điểm danh để xếp học bù.
        </p>
      )}
      {submitError ? (
        <div className="mb-3 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {submitError}
        </div>
      ) : null}
      <form
        id="makeup-session-form"
        onSubmit={handleSubmit(async (v) => {
          setSubmitError(null);
          try {
            await Promise.resolve(
              onSubmit({
                attendanceId: v.attendanceId,
                makeupDate: v.makeupDate,
                makeup_date: v.makeupDate,
                shift: Number(v.shift) as 1 | 2,
                roomId: v.roomId,
                teacherId: v.teacherId,
                note: v.note?.trim() || undefined,
              }),
            );
          } catch (err: unknown) {
            const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message?: string }).message) : 'Không tạo được buổi học bù (trùng phòng/GV hoặc lỗi khác).';
            setSubmitError(msg);
            toast.error(msg);
          }
        })}
      >
        <FormSelect
          label="Buổi vắng (có phép)"
          options={attendanceOptions}
          {...register('attendanceId')}
          error={errors.attendanceId?.message}
          disabled={eligibleAttendances.length === 0}
        />
        <div className="mt-3">
          <FormInput
            label="Ngày học bù"
            type="date"
            {...register('makeupDate')}
            error={errors.makeupDate?.message}
          />
        </div>
        <div className="mt-3">
          <FormSelect label="Ca" options={shiftOptions} {...register('shift')} error={errors.shift?.message} />
        </div>
        {roomsLoading ? (
          <p className="mt-2 text-sm text-[var(--text-muted)]">Đang tải phòng…</p>
        ) : (
          <div className="mt-3">
            <FormSelect label="Phòng" options={roomOptions} {...register('roomId')} error={errors.roomId?.message} />
          </div>
        )}
        {teachersLoading ? (
          <p className="mt-2 text-sm text-[var(--text-muted)]">Đang tải GV…</p>
        ) : (
          <div className="mt-3">
            <FormSelect
              label="Giáo viên"
              options={teacherOptions}
              {...register('teacherId')}
              error={errors.teacherId?.message}
            />
          </div>
        )}
        <div className="mt-3">
          <FormInput label="Ghi chú" {...register('note')} error={errors.note?.message} placeholder="Tuỳ chọn" />
        </div>
        {conflictQueryEnabled ? (
          <div className="mt-4 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-base)]/80 px-3 py-2 text-sm">
            <p className="font-medium text-[var(--text-primary)]">Kiểm tra lịch (xem trước)</p>
            {conflictLoading || !conflictPreview ? (
              <p className="mt-1 text-[var(--text-muted)]">Đang kiểm tra…</p>
            ) : (
              <ul className="mt-1 space-y-1 text-[var(--text-secondary)]">
                <li>
                  Phòng:{' '}
                  {conflictPreview.room.hasConflict ? (
                    <span className="text-amber-400">{conflictPreview.room.conflictReason ?? 'Trùng lịch'}</span>
                  ) : (
                    <span className="text-green-400">Không trùng</span>
                  )}
                </li>
                <li>
                  Giáo viên:{' '}
                  {conflictPreview.teacher.hasConflict ? (
                    <span className="text-amber-400">{conflictPreview.teacher.conflictReason ?? 'Trùng lịch'}</span>
                  ) : (
                    <span className="text-green-400">Không trùng</span>
                  )}
                </li>
              </ul>
            )}
            <p className="mt-2 text-xs text-[var(--text-muted)]">
              Kết quả chỉ mang tính gợi ý; quyết định cuối khi bấm Tạo vẫn do BE xác thực lại.
            </p>
          </div>
        ) : null}
      </form>
    </Modal>
  );
}
