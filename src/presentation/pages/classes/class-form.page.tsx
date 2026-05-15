import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AirVent, BookOpen, Check, GraduationCap, Monitor, Plane, Star } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { FormInput } from '@/shared/ui/form/form-input';
import { Input } from '@/shared/ui/input';
import { useClasses, useParsedPrograms, useParsedRooms } from '@/presentation/hooks/classes/use-classes';
import { useCreateClass, useGenerateSessions } from '@/presentation/hooks/classes/use-class-mutations';
import { useUsers } from '@/presentation/hooks/system/use-users';
import { FALLBACK_PROGRAMS, SHIFT_OPTIONS } from '@/presentation/components/classes/class-form.constants';
import { WEEKDAY_LABELS, WEEKDAY_OPTIONS } from '@/shared/constants/config';
import { parseCreatedId } from '@/infrastructure/services/class-parse.util';
import { RoutePaths } from '@/app/router/route-paths';
import type { ProgramOption } from '@/shared/types/class.type';
import type { ClassResponse } from '@/shared/types/api-contract';
import { ROLES } from '@/shared/constants/roles';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { cn } from '@/shared/lib/cn';
import { toast } from 'sonner';
import { applyValidationErrorsFromForm, toastApiError } from '@/presentation/hooks/toast-api-error';
import { inferProgramSlug, resolveProgramCode } from '@/presentation/components/classes/program-theme';
import { formatDate } from '@/shared/lib/date';
import { scheduleDays as formatSchedulePreview } from '@/shared/lib/date';

const SCHEDULE_MIN_GAP = 2;

const scheduleDaysSchema = z
  .array(z.number().int().min(2).max(7))
  .superRefine((days, ctx) => {
    if (days.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Chưa chọn ngày học' });
      return;
    }
    if (days.length === 1) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Cần chọn thêm 1 ngày nữa' });
      return;
    }
    if (days.length > 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Chỉ được chọn đúng 2 ngày' });
      return;
    }
    const [a, b] = days;
    if (a === b) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Không được chọn cùng 1 ngày' });
      return;
    }
    const s = [...days].sort((x, y) => x - y);
    if (s[1] - s[0] < SCHEDULE_MIN_GAP) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Hai ngày học phải cách nhau ít nhất 1 ngày' });
    }
  })
  .transform((days) => [...days].sort((a, b) => a - b));

const formSchema = z.object({
  programId: z.string().min(1, 'Chọn chương trình'),
  roomId: z.string().min(1, 'Chọn phòng'),
  shift: z.union([z.literal(1), z.literal(2)]),
  scheduleDays: scheduleDaysSchema,
  teacherId: z.string().min(1, 'Chọn giáo viên từ danh sách'),
  startDate: z
    .string()
    .min(1, 'Chọn ngày khai giảng')
    .refine(
      (val) => {
        const t = new Date(`${val}T12:00:00`);
        return !Number.isNaN(t.getTime());
      },
      { message: 'Ngày không hợp lệ' },
    )
    .refine(
      (val) => {
        const t = new Date(`${val}T12:00:00`);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        t.setHours(0, 0, 0, 0);
        return t >= today;
      },
      { message: 'Ngày khai giảng không được là ngày trong quá khứ' },
    ),
});

type FormValues = z.infer<typeof formSchema>;

const PROGRAM_ICONS: Record<string, typeof BookOpen> = {
  kindy: BookOpen,
  starters: Star,
  movers: GraduationCap,
  flyers: Plane,
};

function ProgramIcon({ name }: { name: string }) {
  const slug = inferProgramSlug(name);
  const Icon = slug ? PROGRAM_ICONS[slug] ?? BookOpen : BookOpen;
  return <Icon className="size-6 text-brand-400" strokeWidth={1.5} />;
}

/** Gợi ý realtime — khớp rule gap >= 2 */
function scheduleInlineHint(days: number[]): { tone: 'muted' | 'warn' | 'err' | 'ok'; text: string } {
  if (days.length === 0) return { tone: 'muted', text: 'Chưa chọn ngày học' };
  if (days.length === 1) return { tone: 'warn', text: 'Cần chọn thêm 1 ngày nữa' };
  const s = [...days].sort((a, b) => a - b);
  if (s[1] - s[0] < SCHEDULE_MIN_GAP) {
    return {
      tone: 'err',
      text: `${WEEKDAY_LABELS[s[0]]} và ${WEEKDAY_LABELS[s[1]]} liền nhau — không hợp lệ`,
    };
  }
  return {
    tone: 'ok',
    text: `✓ Lịch học: ${formatSchedulePreview(s)}`,
  };
}

export function ClassFormPage() {
  const navigate = useNavigate();
  const { programs: apiPrograms, isLoading: loadingPrograms } = useParsedPrograms();
  const { rooms, isLoading: loadingRooms } = useParsedRooms();

  const programs: ProgramOption[] = useMemo(
    () => (apiPrograms.length ? apiPrograms : FALLBACK_PROGRAMS),
    [apiPrograms],
  );

  const { users: teachers } = useUsers({
    page: 1,
    limit: 300,
    role: ROLES.TEACHER,
    isActive: true,
  });

  const createClass = useCreateClass();
  const generateSessions = useGenerateSessions();
  const [submitting, setSubmitting] = useState(false);
  const [roomSearch, setRoomSearch] = useState('');
  const [teacherSearch, setTeacherSearch] = useState('');
  const [genDialogOpen, setGenDialogOpen] = useState(false);
  const [pendingClassId, setPendingClassId] = useState<string | null>(null);
  const [pendingClassCode, setPendingClassCode] = useState<string>('');
  const [pendingStartDate, setPendingStartDate] = useState<string>('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      programId: '',
      roomId: '',
      shift: 1,
      scheduleDays: [],
      teacherId: '',
      startDate: '',
    },
  });

  const pid = watch('programId');
  const selectedProgram = programs.find((p) => p.id === pid);
  const scheduleDaysWatch = watch('scheduleDays') ?? [];

  const filteredRooms = useMemo(() => {
    const q = roomSearch.trim().toLowerCase();
    if (!q) return rooms;
    return rooms.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.code && r.code.toLowerCase().includes(q)) ||
        (r.roomCode && r.roomCode.toLowerCase().includes(q)),
    );
  }, [rooms, roomSearch]);

  const filteredTeachers = useMemo(() => {
    const q = teacherSearch.trim().toLowerCase();
    if (!q) return teachers;
    return teachers.filter(
      (t) =>
        t.fullName.toLowerCase().includes(q) ||
        t.userCode.toLowerCase().includes(q),
    );
  }, [teachers, teacherSearch]);

  const scheduleHint = useMemo(() => scheduleInlineHint(scheduleDaysWatch), [scheduleDaysWatch]);
  const shiftWatch = watch('shift');

  const { classes: activeClasses } = useClasses({
    page: 1,
    limit: 500,
    status: 'active',
    shift: shiftWatch === 2 ? 'SHIFT_2' : 'SHIFT_1',
  });

  const roomConflicts = useMemo(() => {
    const selectedDays = [...scheduleDaysWatch].sort((a, b) => a - b);
    if (selectedDays.length !== 2) return new Map<string, string>();
    const overlaps = (a: number[], b: number[]) => a.some((d) => b.includes(d));
    const m = new Map<string, string>();
    for (const c of activeClasses) {
      const cRoomId = c.roomId;
      const cDaysRaw = (c as { scheduleDays?: number[]; schedule_days?: number[] }).scheduleDays
        ?? (c as { scheduleDays?: number[]; schedule_days?: number[] }).schedule_days
        ?? [];
      const cDays = Array.isArray(cDaysRaw) ? cDaysRaw : [];
      if (!cRoomId || !cDays.length) continue;
      if (!overlaps(selectedDays, cDays)) continue;
      const roomCode = c.roomCode ?? c.roomName ?? cRoomId;
      m.set(cRoomId, `Phòng ${roomCode} đã có lớp ${c.classCode} cùng lịch`);
    }
    return m;
  }, [activeClasses, scheduleDaysWatch]);

  const roomsByFloor = useMemo(() => {
    const out: Record<string, typeof filteredRooms> = {};
    for (const r of filteredRooms) {
      const code = (r.roomCode ?? r.code ?? '').toString();
      const m = code.match(/(\d)/);
      const floor = m ? `Tầng ${m[1]}` : 'Khác';
      out[floor] ??= [];
      out[floor].push(r);
    }
    return out;
  }, [filteredRooms]);

  const toggleScheduleDay = (day: number) => {
    const cur = scheduleDaysWatch;
    if (cur.includes(day)) {
      setValue(
        'scheduleDays',
        cur.filter((d) => d !== day),
        { shouldValidate: true },
      );
    } else if (cur.length < 2) {
      setValue('scheduleDays', [...cur, day], { shouldValidate: true });
    }
  };

  const runAfterCreate = async (classId: string, startDate: string, doGenerate: boolean) => {
    setGenDialogOpen(false);
    if (doGenerate && startDate) {
      try {
        const result = await generateSessions.mutateAsync({
          id: classId,
          body: { startDate },
        });
        toast.success(
          `Đã tạo ${result.sessionsCreated} buổi học từ ${formatDate(result.firstDate)} đến ${formatDate(result.lastDate)}`,
        );
      } catch (e) {
        toastApiError(e);
      }
    }
    navigate(RoutePaths.CLASS_DETAIL.replace(':classId', classId));
  };

  const onSubmit = async (values: FormValues) => {
    const program = programs.find((p) => p.id === values.programId);
    const programCode = resolveProgramCode(program);
    if (!programCode) {
      toast.error('Không xác định được mã chương trình');
      return;
    }

    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        programCode,
        roomId: values.roomId,
        shift: values.shift,
        scheduleDays: values.scheduleDays,
        teacherId: values.teacherId,
        startDate: values.startDate,
      };
      const res = (await createClass.mutateAsync(payload)) as ClassResponse;
      const newId = parseCreatedId(res) ?? res.id;
      const code = res.classCode ?? '';
      if (newId) {
        setPendingClassId(newId);
        setPendingClassCode(code);
        setPendingStartDate(values.startDate);
        setGenDialogOpen(true);
      } else {
        navigate(RoutePaths.CLASSES);
      }
    } catch (e) {
      if (!applyValidationErrorsFromForm(e, setError)) {
        toastApiError(e);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-10">
      <div>
        <Button type="button" variant="ghost" size="sm" onClick={() => navigate(RoutePaths.CLASSES)}>
          ← Danh sách lớp
        </Button>
        <h1 className="mt-2 font-display text-xl font-semibold text-[var(--text-primary)]">Tạo lớp mới</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">Chọn chương trình, phòng, ca và lịch cố định.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">Chương trình</h2>
            {loadingPrograms ? (
              <p className="text-sm text-[var(--text-muted)]">Đang tải…</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {programs.map((p) => {
                  const selected = pid === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setValue('programId', p.id, { shouldValidate: true })}
                      className={cn(
                        'relative flex flex-col rounded-2xl border p-4 text-left transition-colors',
                        selected
                          ? 'border-brand-500 bg-brand-500/5 shadow-[0_0_0_1px_rgba(108,99,255,0.35)]'
                          : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)] hover:border-[var(--border-strong)]',
                      )}
                    >
                      {selected ? (
                        <span className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-full bg-brand-500 text-white">
                          <Check className="size-3.5" strokeWidth={2.5} />
                        </span>
                      ) : null}
                      <ProgramIcon name={p.name} />
                      <span className="mt-2 font-medium text-[var(--text-primary)]">{p.name}</span>
                      {p.feePerSession != null ? (
                        <span className="mt-1 text-xs text-[var(--text-muted)]">
                          {p.feePerSession.toLocaleString('vi-VN')} ₫ / buổi
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            )}
            {errors.programId ? <p className="mt-2 text-sm text-red-400">{errors.programId.message}</p> : null}
            <input type="hidden" {...register('programId')} />
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">Phòng học</h2>
            <p className="mb-2 text-xs text-[var(--text-muted)]">
              Phòng bị mờ là phòng đã có lớp active cùng ca và trùng ít nhất một thứ trong tuần với hai ngày bạn chọn. Nhóm theo
              tầng chỉ để lọc nhanh theo mã phòng, không phải quy tắc trùng lịch. Giáo viên được kiểm tra trùng khi bấm Tạo lớp.
            </p>
            <Input
              placeholder="Tìm mã phòng, tên phòng…"
              value={roomSearch}
              onChange={(e) => setRoomSearch(e.target.value)}
              className="mb-3"
            />
            {loadingRooms ? (
              <p className="text-sm text-[var(--text-muted)]">Đang tải phòng…</p>
            ) : (
              <div className="max-h-56 space-y-3 overflow-y-auto rounded-xl border border-[var(--border-subtle)] p-2">
                {Object.entries(roomsByFloor).map(([floor, floorRooms]) => (
                  <div key={floor} className="space-y-2">
                    <p className="px-1 text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">{floor}</p>
                    {floorRooms.map((r) => {
                      const selected = watch('roomId') === r.id;
                      const conflictReason = roomConflicts.get(r.id);
                      const disabled = Boolean(conflictReason);
                      return (
                        <label
                          key={r.id}
                          title={conflictReason ?? undefined}
                          className={cn(
                            'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm',
                            disabled && 'cursor-not-allowed opacity-55',
                            !disabled && 'cursor-pointer',
                            selected ? 'border-brand-500/50 bg-brand-500/10' : 'border-transparent hover:bg-[var(--bg-elevated)]',
                          )}
                        >
                          <input
                            type="radio"
                            value={r.id}
                            className="text-brand-500"
                            {...register('roomId')}
                            disabled={disabled}
                          />
                          <span className="flex-1 text-[var(--text-primary)]">
                            {(r.roomCode ?? r.code ?? r.name)} · {r.capacity != null ? `${r.capacity} chỗ` : '—'}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[var(--text-muted)]">
                            <Monitor className="size-3.5" />
                            <AirVent className="size-3.5" />
                          </span>
                        </label>
                      );
                    })}
                  </div>
                ))}
                {filteredRooms.length === 0 ? (
                  <p className="py-4 text-center text-sm text-[var(--text-muted)]">Không có phòng phù hợp.</p>
                ) : null}
              </div>
            )}
            {errors.roomId ? <p className="mt-2 text-sm text-red-400">{errors.roomId.message}</p> : null}
          </section>
        </div>

        <div className="space-y-6">
          {selectedProgram?.feePerSession != null ? (
            <div className="rounded-2xl border border-brand-500/20 bg-brand-500/5 px-4 py-3 text-sm text-[var(--text-secondary)]">
              Học phí gợi ý:{' '}
              <strong className="text-brand-200">
                {selectedProgram.feePerSession.toLocaleString('vi-VN')} ₫
              </strong>{' '}
              / buổi
            </div>
          ) : null}

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">Ca học</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {SHIFT_OPTIONS.map((s) => {
                const sel = watch('shift') === s.value;
                return (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setValue('shift', s.value, { shouldValidate: true })}
                    className={cn(
                      'rounded-2xl border px-4 py-4 text-left text-sm transition-colors',
                      sel ? 'border-brand-500 bg-brand-500/10' : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)] hover:border-[var(--border-strong)]',
                    )}
                  >
                    <span className="font-medium leading-snug text-[var(--text-primary)]">{s.label}</span>
                  </button>
                );
              })}
            </div>
            {errors.shift ? <p className="mt-2 text-sm text-red-400">{errors.shift.message}</p> : null}
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">Lịch trong tuần</h2>
            <p className="mb-2 text-xs text-[var(--text-muted)]">Chọn đúng 2 ngày (Thứ 2–Thứ 7), không được học hai ngày liền nhau.</p>
            <div className="flex flex-wrap gap-2">
              {WEEKDAY_OPTIONS.map(({ value, label }) => {
                const selected = scheduleDaysWatch.includes(value);
                const disabled = scheduleDaysWatch.length >= 2 && !selected;
                return (
                  <button
                    key={value}
                    type="button"
                    disabled={disabled}
                    onClick={() => toggleScheduleDay(value)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-sm transition-colors',
                      selected && 'border-brand-500 bg-brand-500/15 text-brand-200',
                      !selected && !disabled && 'border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]',
                      disabled && !selected && 'cursor-not-allowed border-[var(--border-subtle)] text-[var(--text-muted)] opacity-50',
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <p
              className={cn(
                'mt-2 text-sm',
                scheduleHint.tone === 'muted' && 'text-[var(--text-muted)]',
                scheduleHint.tone === 'warn' && 'text-amber-400',
                scheduleHint.tone === 'err' && 'text-red-400',
                scheduleHint.tone === 'ok' && 'text-emerald-400',
              )}
            >
              {scheduleHint.text}
            </p>
            {errors.scheduleDays ? (
              <p className="mt-1 text-sm text-red-400">{errors.scheduleDays.message as string}</p>
            ) : null}
          </section>

          <FormInput
            label="Ngày khai giảng"
            type="date"
            {...register('startDate')}
            error={errors.startDate?.message}
          />

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">Giáo viên phụ trách</h2>
            <Input
              placeholder="Tìm theo tên, mã GV…"
              value={teacherSearch}
              onChange={(e) => setTeacherSearch(e.target.value)}
              className="mb-3"
            />
            <div className="max-h-52 space-y-2 overflow-y-auto rounded-xl border border-[var(--border-subtle)] p-2">
              {filteredTeachers.map((t) => {
                const sel = watch('teacherId') === t.id;
                return (
                  <label
                    key={t.id}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm',
                      sel ? 'border-brand-500/50 bg-brand-500/10' : 'border-transparent hover:bg-[var(--bg-elevated)]',
                    )}
                  >
                    <input type="radio" value={t.id} {...register('teacherId')} />
                    <span className="text-[var(--text-primary)]">
                      {t.fullName}{' '}
                      <span className="font-mono text-[var(--text-muted)]">({t.userCode})</span>
                    </span>
                  </label>
                );
              })}
              {filteredTeachers.length === 0 ? (
                <p className="py-4 text-center text-sm text-[var(--text-muted)]">Không có giáo viên.</p>
              ) : null}
            </div>
            {errors.teacherId ? <p className="mt-2 text-sm text-red-400">{errors.teacherId.message}</p> : null}
          </section>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => navigate(RoutePaths.CLASSES)}>
              Hủy
            </Button>
            <Button type="submit" isLoading={submitting}>
              Tạo lớp
            </Button>
          </div>
        </div>
      </form>

      <ConfirmDialog
        open={genDialogOpen}
        onClose={() => {
          const id = pendingClassId;
          setGenDialogOpen(false);
          setPendingClassId(null);
          if (id) void runAfterCreate(id, pendingStartDate, false);
        }}
        variant="warning"
        title={pendingClassCode ? `Lớp ${pendingClassCode} đã tạo thành công!` : 'Đã tạo lớp thành công!'}
        message={
          'Bạn có muốn tạo lịch học ngay không?\n(Hệ thống sẽ tự tạo 24 buổi, bỏ qua ngày lễ)'
        }
        confirmLabel="Tạo lịch học →"
        cancelLabel="Để sau"
        loading={generateSessions.isPending}
        onConfirm={async () => {
          if (!pendingClassId) return;
          const id = pendingClassId;
          const d = pendingStartDate;
          setPendingClassId(null);
          await runAfterCreate(id, d, true);
        }}
      />
    </div>
  );
}
