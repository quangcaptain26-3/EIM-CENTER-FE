import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/shared/ui/button';
import { FormInput } from '@/shared/ui/form/form-input';
import { SearchBox } from '@/shared/ui/search-box';
import { Avatar } from '@/shared/ui/avatar';
import { useCreateReceipt } from '@/presentation/hooks/finance/use-receipts';
import { useStudent, useStudentEnrollments, useStudentSearchSuggestions } from '@/presentation/hooks/students/use-students';
import type { StudentSearchSuggestion } from '@/shared/types/student.type';
import type { EnrollmentCardModel } from '@/shared/types/student.type';
import { RoutePaths } from '@/app/router/route-paths';
import { parseCreatedId } from '@/infrastructure/services/class-parse.util';
import { amountToWordsVi } from '@/shared/lib/currency';
import { formatAmountDots, parseAmountDots, formatVnd } from '@/shared/utils/format-vnd';
import { ENROLLMENT_STATUS } from '@/shared/constants/statuses';
import { cn } from '@/shared/lib/cn';
import { getDebt } from '@/infrastructure/services/finance.api';
import { parseDebtSummary } from '@/infrastructure/services/finance-parse.util';
import { QUERY_KEYS } from '@/infrastructure/query/query-keys';
import { getStudentEnrollments } from '@/infrastructure/services/students.api';
import { parseEnrollmentsList } from '@/infrastructure/services/student-parse.util';

/** Ghi danh mới vào lớp thường là pending/reserved — phải cho thu học phí trước khi kích hoạt. */
const ALLOWED_ENROLL = [
  ENROLLMENT_STATUS.pending,
  ENROLLMENT_STATUS.reserved,
  ENROLLMENT_STATUS.trial,
  ENROLLMENT_STATUS.active,
  ENROLLMENT_STATUS.paused,
  ENROLLMENT_STATUS.dropped,
  ENROLLMENT_STATUS.completed,
] as const;

const schema = z.object({
  payerName: z.string().min(1, 'Nhập tên người nộp'),
  payerAddress: z.string().optional(),
  amount: z.number().refine((v) => v !== 0, { message: 'Số tiền khác 0' }),
  paymentMethod: z.enum(['cash', 'transfer']),
  paymentDate: z.string().min(1, 'Chọn ngày'),
  payerSignatureName: z.string().optional(),
  note: z.string().optional(),
  reason: z.string().min(1, 'Nhập lý do'),
});

type FormValues = z.infer<typeof schema>;

export default function ReceiptFormPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [studentQuery, setStudentQuery] = useState('');
  const [debouncedStudentQ, setDebouncedStudentQ] = useState('');
  const [studentId, setStudentId] = useState<string | null>(() => searchParams.get('studentId'));
  const [enrollmentId, setEnrollmentId] = useState<string>(() => searchParams.get('enrollmentId') ?? '');
  const [amountStr, setAmountStr] = useState('');
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [urlSynced, setUrlSynced] = useState(() => searchParams.toString());
  if (searchParams.toString() !== urlSynced) {
    setUrlSynced(searchParams.toString());
    const sid = searchParams.get('studentId');
    const eid = searchParams.get('enrollmentId');
    if (sid) {
      setStudentId(sid);
      setSuggestOpen(false);
    }
    if (eid) setEnrollmentId(eid);
  }

  const { student } = useStudent(studentId ?? undefined);
  const { enrollments, isLoading: loadEnr } = useStudentEnrollments(studentId ?? undefined);
  const { students: searchStudents, byPhone, isLoading: searchLoading } = useStudentSearchSuggestions(
    debouncedStudentQ,
    suggestOpen && debouncedStudentQ.trim().length >= 1,
  );

  const suggestionList = useMemo(() => {
    const m = new Map<string, StudentSearchSuggestion>();
    for (const s of [...searchStudents, ...byPhone]) {
      m.set(s.id, s);
    }
    return [...m.values()];
  }, [searchStudents, byPhone]);

  const createM = useCreateReceipt();

  const filteredEnrollments = useMemo(
    () => enrollments.filter((e) => ALLOWED_ENROLL.includes(e.status as (typeof ALLOWED_ENROLL)[number])),
    [enrollments],
  );

  const debtQueries = useQueries({
    queries: filteredEnrollments.map((e) => ({
      queryKey: QUERY_KEYS.FINANCE.debt(e.id),
      queryFn: () => getDebt(e.id),
      enabled: Boolean(studentId && filteredEnrollments.length > 0),
      staleTime: 30_000,
    })),
  });

  const debtByEnrollmentId = useMemo(() => {
    const m = new Map<string, number | null>();
    filteredEnrollments.forEach((e, i) => {
      const raw = debtQueries[i]?.data;
      const d = raw ? parseDebtSummary(raw) : null;
      m.set(e.id, d?.debt ?? null);
    });
    return m;
  }, [filteredEnrollments, debtQueries]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      payerName: '',
      payerAddress: '',
      amount: 0,
      paymentMethod: 'cash',
      paymentDate: new Date().toISOString().slice(0, 10),
      payerSignatureName: '',
      note: '',
      reason: '',
    },
  });

  const amountNum = useWatch({ control, name: 'amount' });
  const paymentMethod = useWatch({ control, name: 'paymentMethod' });

  const displayStudentQuery =
    studentId && student?.fullName
      ? `${student.fullName} (${student.studentCode})`
      : studentQuery;

  useEffect(() => {
    if (student?.fullName) {
      setValue('payerName', student.parentName ? `${student.fullName} (PH: ${student.parentName})` : student.fullName);
      setValue('payerSignatureName', student.parentName ?? student.fullName);
    }
  }, [student, setValue]);

  const selectedEnrollment = useMemo(
    () => filteredEnrollments.find((x) => x.id === enrollmentId),
    [filteredEnrollments, enrollmentId],
  );

  useEffect(() => {
    const en = selectedEnrollment;
    if (en) {
      const cls = en.classCode ?? en.className ?? '';
      const prog = en.programName ?? en.programCode ?? '—';
      setValue('reason', `Học phí khóa ${prog} - Lớp ${cls}`);
    }
  }, [selectedEnrollment, setValue]);

  const wordsPreview = useMemo(() => {
    const n = Number(amountNum);
    return Number.isFinite(n) && n !== 0 ? amountToWordsVi(n) : null;
  }, [amountNum]);

  const onValid = async (v: FormValues) => {
    if (!studentId || !enrollmentId) {
      toast.error('Chọn học viên và ghi danh');
      return;
    }
    const prevStatus = filteredEnrollments.find((x) => x.id === enrollmentId)?.status;
    /** Không gửi amount_in_words — BE tự sinh khi lưu. */
    const body: Record<string, unknown> = {
      payerName: v.payerName,
      payerAddress: v.payerAddress || undefined,
      studentId,
      enrollmentId,
      reason: v.reason,
      amount: v.amount,
      paymentMethod: v.paymentMethod,
      paymentDate: v.paymentDate,
      note: v.note || undefined,
      payerSignatureName: v.payerSignatureName || v.payerName,
    };
    try {
      const res = await createM.mutateAsync(body);
      toast.success('Phiếu thu đã tạo');
      const warning = (res as { warning?: string } | null)?.warning;
      if (warning) {
        toast.warning(warning);
      }

      const freshRaw = await queryClient.fetchQuery({
        queryKey: QUERY_KEYS.STUDENTS.enrollments(studentId),
        queryFn: () => getStudentEnrollments(studentId),
      });
      const fresh = parseEnrollmentsList(freshRaw);
      const nowEn = fresh.find((x) => x.id === enrollmentId);
      if (
        v.amount > 0 &&
        prevStatus != null &&
        ['pending', 'reserved', 'trial'].includes(prevStatus) &&
        nowEn?.status === ENROLLMENT_STATUS.active
      ) {
        toast.info('Học viên đã được kích hoạt');
      }

      const payload = res as unknown;
      const id =
        parseCreatedId(payload) ??
        ((payload as { receipt?: { id?: string } })?.receipt?.id ?? null);
      if (id) navigate(RoutePaths.RECEIPT_DETAIL.replace(':id', id));
      else navigate(RoutePaths.RECEIPTS);
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'message' in e ? String((e as { message?: string }).message) : 'Lỗi tạo phiếu';
      toast.error(msg);
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-6">
      <h1 className="mb-6 text-xl font-semibold text-[var(--text-primary)]">Tạo phiếu thu</h1>

      <form onSubmit={handleSubmit(onValid)} className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Người nộp tiền</h2>
          <FormInput label="Tên người nộp *" {...register('payerName')} error={errors.payerName?.message} />
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">Địa chỉ</label>
            <textarea
              {...register('payerAddress')}
              rows={3}
              className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-base)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
              placeholder="Tuỳ chọn"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">Tìm học viên</label>
            <SearchBox
              placeholder="Tên, mã HS, SĐT PH…"
              value={displayStudentQuery}
              delay={300}
              onValueChange={(q) => {
                setStudentQuery(q);
                setStudentId(null);
                setEnrollmentId('');
                setSuggestOpen(true);
              }}
              onSearch={setDebouncedStudentQ}
              isLoading={searchLoading}
              inputClassName="bg-[var(--bg-base)] border-[var(--border-default)] text-[var(--text-primary)]"
            />
            {suggestOpen && debouncedStudentQ.trim().length >= 1 && suggestionList.length > 0 ? (
              <div className="mt-2 max-h-56 overflow-auto rounded-lg border border-[var(--border-default)] bg-[var(--bg-base)]">
                {suggestionList.map((s: StudentSearchSuggestion) => (
                  <button
                    key={s.id}
                    type="button"
                    className="flex w-full items-start gap-3 px-3 py-2.5 text-left text-sm hover:bg-[var(--bg-elevated)]"
                    onClick={() => {
                      setStudentId(s.id);
                      setStudentQuery(`${s.fullName} (${s.studentCode})`);
                      setEnrollmentId('');
                      setSuggestOpen(false);
                      reset((prev) => ({ ...prev, payerName: '', payerSignatureName: '' }));
                    }}
                  >
                    <Avatar name={s.fullName} size="sm" className="mt-0.5 shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className="font-medium text-[var(--text-primary)]">{s.fullName}</span>
                      <span className="mt-0.5 block font-mono text-xs text-[var(--text-muted)]">{s.studentCode}</span>
                      {s.currentLevelLabel ? (
                        <span className="mt-0.5 block text-xs text-[var(--text-secondary)]">
                          Cấp: {s.currentLevelLabel}
                          {s.activeClassCode ? ` · Lớp ${s.activeClassCode}` : ''}
                        </span>
                      ) : null}
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {studentId ? (
            <div>
              <p className="mb-2 text-xs font-medium text-[var(--text-muted)]">Ghi danh *</p>
              {loadEnr ? (
                <p className="text-sm text-[var(--text-muted)]">Đang tải ghi danh…</p>
              ) : filteredEnrollments.length === 0 ? (
                <p className="text-sm text-amber-400/90">
                  Học viên chưa có ghi danh nào (pending / trial / active…). Tạo ghi danh vào lớp trước, rồi quay lại đây.
                </p>
              ) : (
                <ul className="space-y-2">
                  {filteredEnrollments.map((e: EnrollmentCardModel) => {
                    const selected = enrollmentId === e.id;
                    const debt = debtByEnrollmentId.get(e.id);
                    const prog = e.programName ?? e.programCode ?? '—';
                    const cls = e.classCode ?? e.className ?? '—';
                    const fee = e.tuitionFee ?? e.tuitionAmount ?? 0;
                    return (
                      <li key={e.id}>
                        <button
                          type="button"
                          onClick={() => setEnrollmentId(e.id)}
                          className={cn(
                            'w-full rounded-xl border px-3 py-3 text-left text-sm transition-colors',
                            selected
                              ? 'border-brand-500/60 bg-brand-500/10 ring-1 ring-brand-500/30'
                              : 'border-[var(--border-default)] bg-[var(--bg-base)] hover:border-[var(--border-strong)]',
                          )}
                        >
                          <p className="font-medium text-[var(--text-primary)]">{prog}</p>
                          <p className="text-xs text-[var(--text-secondary)]">Lớp: {cls}</p>
                          <p className="mt-1 text-xs text-[var(--text-muted)]">
                            Học phí: {formatVnd(fee)}
                            {debt != null ? (
                              <span className="text-[var(--text-secondary)]"> · Học phí còn lại: {formatVnd(debt)}</span>
                            ) : (
                              <span className="text-[var(--text-muted)]"> · Học phí còn lại: …</span>
                            )}
                          </p>
                          <p className="mt-0.5 text-[11px] uppercase tracking-wide text-[var(--text-muted)]">{e.status}</p>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ) : null}

          <FormInput label="Lý do thu *" {...register('reason')} error={errors.reason?.message} />
        </div>

        <div className="space-y-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Chi tiết phiếu</h2>
          {selectedEnrollment ? (
            <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-base)]/60 px-3 py-2 text-sm text-[var(--text-secondary)]">
              <span className="text-[var(--text-muted)]">Học phí (ghi danh): </span>
              <span className="font-medium tabular-nums text-[var(--text-primary)]">
                {formatVnd(selectedEnrollment.tuitionFee ?? selectedEnrollment.tuitionAmount ?? 0)}
              </span>
              <span className="ml-2 text-[11px] text-[var(--text-muted)]">(chỉ đọc)</span>
            </div>
          ) : null}
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">Số tiền *</label>
            <input
              type="text"
              inputMode="numeric"
              className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-base)] px-3 py-2 text-[var(--text-primary)]"
              value={amountStr}
              onChange={(e) => {
                const raw = e.target.value;
                setAmountStr(raw);
                setValue('amount', parseAmountDots(raw), { shouldValidate: true });
              }}
              onBlur={() => {
                const n = parseAmountDots(amountStr);
                setAmountStr(n ? formatAmountDots(n) : '');
                setValue('amount', n);
              }}
            />
            {errors.amount ? <p className="mt-1 text-xs text-red-400">{errors.amount.message}</p> : null}
          </div>

          {wordsPreview ? (
            <p className="text-sm italic text-[var(--text-muted)]">
              Xem trước: {wordsPreview}
            </p>
          ) : (
            <p className="text-sm italic text-[var(--text-muted)]">Xem trước: —</p>
          )}
          <p className="text-[11px] text-[var(--text-muted)]">
            Đây chỉ là xem trước cục bộ — bằng chữ chính thức do hệ thống tạo khi lưu.
          </p>

          <div>
            <p className="mb-2 text-xs font-medium text-[var(--text-muted)]">Hình thức thanh toán</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setValue('paymentMethod', 'cash')}
                className={cn(
                  'rounded-xl border-2 px-4 py-4 text-left transition-all',
                  paymentMethod === 'cash'
                    ? 'border-brand-500 bg-brand-500/10 text-[var(--text-primary)]'
                    : 'border-[var(--border-default)] bg-[var(--bg-base)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]',
                )}
              >
                <span className="text-lg">💵</span>
                <span className="ml-2 font-medium">Tiền mặt</span>
              </button>
              <button
                type="button"
                onClick={() => setValue('paymentMethod', 'transfer')}
                className={cn(
                  'rounded-xl border-2 px-4 py-4 text-left transition-all',
                  paymentMethod === 'transfer'
                    ? 'border-brand-500 bg-brand-500/10 text-[var(--text-primary)]'
                    : 'border-[var(--border-default)] bg-[var(--bg-base)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]',
                )}
              >
                <span className="text-lg">🏦</span>
                <span className="ml-2 font-medium">Chuyển khoản</span>
              </button>
            </div>
          </div>

          <FormInput label="Ngày thanh toán *" type="date" {...register('paymentDate')} error={errors.paymentDate?.message} />
          <FormInput label="Người ký (phiếu)" {...register('payerSignatureName')} />
          <FormInput label="Ghi chú" {...register('note')} />

          <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-base)]/50 p-2 text-xs text-[var(--text-muted)]">
            Số tiền: {amountNum ? formatVnd(amountNum) : '—'}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2 lg:col-span-2">
          <Button type="submit" isLoading={createM.isPending} disabled={!studentId || !enrollmentId}>
            Lưu phiếu thu
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Hủy
          </Button>
        </div>
      </form>
    </div>
  );
}
