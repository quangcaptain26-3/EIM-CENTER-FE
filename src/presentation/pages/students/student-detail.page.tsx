import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Phone, MessageCircle, UserPlus, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { ExpandableText } from '@/shared/ui/expandable-text';
import { PlaceholderText } from '@/shared/ui/placeholder-text';
import { displayText, EMPTY_PLACEHOLDER } from '@/shared/lib/display';
import { FormSelect } from '@/shared/ui/form/form-select';
import { Modal } from '@/shared/ui/modal';
import { Badge, SessionBadge } from '@/shared/ui/badge';
import { Avatar } from '@/shared/ui/avatar';
import { usePermission } from '@/presentation/hooks/use-permission';
import { useStudent, useStudentEnrollments } from '@/presentation/hooks/students/use-students';
import { useEnrollmentDebt } from '@/presentation/hooks/finance/use-finance';
import { DebtIndicator } from '@/presentation/components/finance/debt-indicator';
import { useAttendanceHistory } from '@/presentation/hooks/students/use-attendance';
import { useCreateEnrollment } from '@/presentation/hooks/students/use-enrollment-mutations';
import { useMakeupSessionsList, useCreateMakeupSession } from '@/presentation/hooks/students/use-makeup-sessions';
import { EnrollmentCard } from '@/presentation/components/students/enrollment-card';
import { MakeupModal } from '@/presentation/components/students/makeup-modal';
import { RoutePaths } from '@/app/router/route-paths';
import { ATTENDANCE_STATUS, ENROLLMENT_STATUS } from '@/shared/constants/statuses';
import { useParsedPrograms, useClassesList } from '@/presentation/hooks/classes/use-classes';
import { programPillClass } from '@/presentation/components/classes/program-theme';
import { formatDate, formatDateWithWeekday } from '@/shared/lib/date';
import { formatVnd } from '@/shared/utils/format-vnd';
import { cn } from '@/shared/lib/cn';
import { Tooltip } from '@/shared/ui/tooltip';
import { getScheduleConflictCheck } from '@/infrastructure/services/students.api';
import { scheduleDays } from '@/shared/lib/date';
import { isUuid } from '@/shared/lib/uuid';

type TabKey = 'enroll' | 'attendance' | 'makeup' | 'finance';
type AttFilter = 'all' | 'present' | 'absent';

function genderLabel(g: string | null | undefined): string {
  if (!g) return '';
  const x = g.toLowerCase();
  if (x === 'male' || x === 'nam' || x === 'm') return 'Nam';
  if (x === 'female' || x === 'nu' || x === 'f') return 'Nữ';
  return g;
}

function attendanceCellLetter(status?: string): string {
  if (status === ATTENDANCE_STATUS.present) return 'P';
  if (status === ATTENDANCE_STATUS.late) return 'L';
  if (status === ATTENDANCE_STATUS.absent_excused) return 'A';
  if (status === ATTENDANCE_STATUS.absent_unexcused) return 'U';
  return '';
}

export default function StudentDetailPage() {
  const { id: studentId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canManageAcademicEnrollment: canAcademic } = usePermission();
  const { student, isLoading, refetch: refetchStudent } = useStudent(studentId);
  const { enrollments, isLoading: loadEnr, refetch: refetchEnr } = useStudentEnrollments(studentId);

  const activeEnrollment = useMemo(
    () => enrollments.find((e) => e.status === ENROLLMENT_STATUS.active),
    [enrollments],
  );

  const [tab, setTab] = useState<TabKey>('enroll');
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [programId, setProgramId] = useState('');
  const [classId, setClassId] = useState('');
  const [enrollmentStatus, setEnrollmentStatus] = useState<'reserved' | 'pending' | 'trial'>('pending');
  const [reservationFee, setReservationFee] = useState('');
  const [unavailableDays, setUnavailableDays] = useState<number[]>([]);
  const [scheduleAcknowledged, setScheduleAcknowledged] = useState(false);
  const [makeupOpen, setMakeupOpen] = useState(false);
  const [makeupPrefillAttendanceId, setMakeupPrefillAttendanceId] = useState<string | null>(null);
  const [sessionMin, setSessionMin] = useState('');
  const [sessionMax, setSessionMax] = useState('');
  const [attFilter, setAttFilter] = useState<AttFilter>('all');

  const createEnr = useCreateEnrollment();
  const { history, isLoading: loadAtt } = useAttendanceHistory(activeEnrollment?.id);
  const { items: makeupItems, isLoading: loadMu, refetch: refetchMakeup } = useMakeupSessionsList({
    enrollmentId: activeEnrollment?.id,
  });
  const createMakeup = useCreateMakeupSession();

  const { debt: debtSummary, isLoading: loadFinanceDebt } = useEnrollmentDebt(activeEnrollment?.id);

  const { programs } = useParsedPrograms();
  const { classes, isLoading: loadClasses } = useClassesList({
    page: 1,
    limit: 200,
    programId: programId || undefined,
    status: 'active',
  });

  const programOptions = useMemo(
    () => [{ value: '', label: 'Chọn chương trình' }, ...programs.map((p) => ({ value: p.id, label: p.name }))],
    [programs],
  );

  const classOptions = useMemo(
    () => [
      { value: '', label: programId ? 'Chọn lớp' : 'Chọn chương trình trước' },
      ...classes
        .filter((c) => isUuid(c.id))
        .map((c) => ({ value: c.id, label: `${c.classCode} · ${c.programName ?? ''}` })),
    ],
    [classes, programId],
  );

  const suggestionsQuery = useQuery({
    queryKey: ['schedule-conflict-check', programId, unavailableDays.join(',')],
    queryFn: () => getScheduleConflictCheck({ programId: programId || undefined, unavailableDays }),
    enabled: unavailableDays.length > 0 && Boolean(programId),
  });
  const suggestedClassIds = useMemo(
    () =>
      new Set(
        (suggestionsQuery.data?.classes ?? []).map((r) => String((r as Record<string, unknown>).id ?? '')),
      ),
    [suggestionsQuery.data?.classes],
  );

  const selectedClassForEnroll = useMemo(
    () => (classId ? classes.find((c) => c.id === classId) : undefined),
    [classes, classId],
  );

  const filteredAttendance = useMemo(() => {
    let rows = history;
    const min = sessionMin.trim() ? Number(sessionMin) : null;
    const max = sessionMax.trim() ? Number(sessionMax) : null;
    if (min != null && !Number.isNaN(min)) {
      rows = rows.filter((r) => (r.sessionNo ?? 0) >= min);
    }
    if (max != null && !Number.isNaN(max)) {
      rows = rows.filter((r) => (r.sessionNo ?? 0) <= max);
    }
    if (attFilter === 'present') {
      rows = rows.filter((r) => {
        const s = (r.status ?? '').toLowerCase();
        return s === ATTENDANCE_STATUS.present || s === ATTENDANCE_STATUS.late;
      });
    } else if (attFilter === 'absent') {
      rows = rows.filter((r) => {
        const s = (r.status ?? '').toLowerCase();
        return s === ATTENDANCE_STATUS.absent_excused || s === ATTENDANCE_STATUS.absent_unexcused;
      });
    }
    return rows;
  }, [history, sessionMin, sessionMax, attFilter]);

  const attSummary = useMemo(() => {
    let p = 0,
      l = 0,
      a = 0,
      u = 0;
    for (const r of filteredAttendance) {
      const s = (r.status ?? '').toLowerCase();
      if (s === ATTENDANCE_STATUS.present) p++;
      else if (s === ATTENDANCE_STATUS.late) l++;
      else if (s === ATTENDANCE_STATUS.absent_excused) a++;
      else if (s === ATTENDANCE_STATUS.absent_unexcused) u++;
    }
    return { p, l, a, u, total: filteredAttendance.length };
  }, [filteredAttendance]);
  const attendancePivot = useMemo(() => {
    const bySession = new Map<number, (typeof filteredAttendance)[number]>();
    for (const row of filteredAttendance) {
      if (row.sessionNo != null) bySession.set(row.sessionNo, row);
    }
    return Array.from({ length: 24 }, (_, i) => {
      const sessionNo = i + 1;
      return { sessionNo, row: bySession.get(sessionNo) };
    });
  }, [filteredAttendance]);

  const eligibleMakeupAttendances = useMemo(() => {
    return history
      .filter((h) => h.status === ATTENDANCE_STATUS.absent_excused)
      .map((h) => ({
        id: h.id,
        label: `Buổi #${h.sessionNo ?? '—'} — ${h.sessionDate ?? '—'}`,
      }));
  }, [history]);
  const maxMakeupDate = useMemo(() => {
    const row24 = history.find((h) => h.sessionNo === 24 && h.sessionDate);
    return row24?.sessionDate ?? null;
  }, [history]);

  const canAddEnrollment = canAcademic;

  const levelLabel = student?.currentProgramName ?? student?.currentLevel ?? null;

  if (!studentId) {
    return (
      <div className="p-6">
        <p className="text-slate-500 dark:text-[var(--text-muted)]">Thiếu mã học viên.</p>
      </div>
    );
  }

  if (isLoading && !student) {
    return (
      <div className="p-6">
        <p className="text-slate-500 dark:text-[var(--text-muted)]">Đang tải…</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-6">
        <p className="text-slate-500 dark:text-[var(--text-muted)]">Không tìm thấy học viên.</p>
        <Button type="button" variant="secondary" className="mt-4" onClick={() => navigate(RoutePaths.STUDENTS)}>
          Về danh sách
        </Button>
      </div>
    );
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'enroll', label: 'Ghi danh' },
    { key: 'attendance', label: 'Điểm danh' },
    { key: 'makeup', label: 'Học bù' },
    { key: 'finance', label: 'Tài chính' },
  ];

  const financeHref = activeEnrollment
    ? RoutePaths.STUDENT_FINANCE.replace(':enrollmentId', activeEnrollment.id)
    : null;
  const exportAttendanceHistory = () => {
    const lines = ['Session,Date,Status,Note'];
    for (const item of filteredAttendance) {
      lines.push(
        [
          item.sessionNo ?? '',
          item.sessionDate ?? '',
          item.status ?? '',
          (item.note ?? '').replace(/,/g, ';'),
        ].join(','),
      );
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-history-${student.studentCode}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="-ml-2 text-slate-500 hover:text-slate-800 dark:text-[var(--text-secondary)]"
        onClick={() => navigate(-1)}
      >
        ← Quay lại
      </Button>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--bg-surface)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 flex-col gap-6 sm:flex-row">
            <Avatar name={student.fullName} size="lg" />
            <div className="min-w-0 flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-[var(--text-primary)]">{student.fullName}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-brand-500/15 px-2 py-0.5 font-mono text-sm text-brand-700 dark:text-brand-300">
                    {student.studentCode}
                  </span>
                  {levelLabel ? (
                    <span
                      className={cn(
                        'inline-flex rounded-full border px-2 py-0.5 text-xs font-medium',
                        programPillClass(levelLabel),
                      )}
                    >
                      {levelLabel}
                    </span>
                  ) : (
                    <span className="text-xs italic text-slate-400 dark:text-[var(--text-muted)]">{EMPTY_PLACEHOLDER}</span>
                  )}
                </div>
              </div>
              <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-[var(--text-muted)]">Ngày sinh</p>
                  <p className="mt-0.5 text-slate-800 dark:text-[var(--text-primary)]">
                    {student.dateOfBirth ? formatDate(student.dateOfBirth) : <PlaceholderText value={null} />}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-[var(--text-muted)]">Giới tính</p>
                  <p className="mt-0.5 text-slate-800 dark:text-[var(--text-primary)]">
                    {genderLabel(student.gender) ? (
                      genderLabel(student.gender)
                    ) : (
                      <PlaceholderText value={null} />
                    )}
                  </p>
                </div>
                <div className="sm:col-span-2 lg:col-span-1">
                  <p className="text-xs font-medium text-slate-500 dark:text-[var(--text-muted)]">Trường học</p>
                  <p className="mt-0.5 text-slate-800 dark:text-[var(--text-primary)]">
                    <PlaceholderText value={student.schoolName} />
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-[var(--text-muted)]">Phụ huynh</p>
                <div className="mt-1 space-y-1.5 text-sm text-slate-800 dark:text-[var(--text-primary)]">
                  <p className="flex items-center gap-2">
                    <UserPlus className="size-4 shrink-0 text-slate-400" aria-hidden />
                    <PlaceholderText value={student.parentName} />
                  </p>
                  <p className="flex items-center gap-2 font-mono">
                    <Phone className="size-4 shrink-0 text-slate-400" aria-hidden />
                    <span>
                      SĐT 1: <PlaceholderText value={student.parentPhone} className="font-mono" />
                    </span>
                  </p>
                  <p className="flex items-center gap-2 font-mono">
                    <Phone className="size-4 shrink-0 text-slate-400" aria-hidden />
                    <span>
                      SĐT 2: <PlaceholderText value={student.parentPhone2} className="font-mono" />
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <MessageCircle className="size-4 shrink-0 text-slate-400" aria-hidden />
                    <span>
                      Zalo: <PlaceholderText value={student.parentZalo} />
                    </span>
                  </p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-[var(--text-muted)]">Kết quả test</p>
                  <p className="mt-0.5 text-slate-800 dark:text-[var(--text-primary)]">
                    <PlaceholderText value={student.testResult} />
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-[var(--text-muted)]">Ngày tạo hồ sơ</p>
                  <p className="mt-0.5 text-slate-800 dark:text-[var(--text-primary)]">
                    {student.createdAt ? (
                      formatDate(student.createdAt)
                    ) : (
                      <PlaceholderText value={null} />
                    )}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs font-medium text-slate-500 dark:text-[var(--text-muted)]">Người tạo</p>
                  <p className="mt-0.5 text-slate-800 dark:text-[var(--text-primary)]">
                    {student.createdByName ? (
                      student.createdByName
                    ) : student.createdBy ? (
                      <span className="font-mono text-xs text-slate-600 dark:text-[var(--text-secondary)]">{student.createdBy}</span>
                    ) : (
                      <PlaceholderText value={null} />
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {canAddEnrollment ? (
              <Button type="button" onClick={() => setEnrollOpen(true)}>
                Ghi danh mới
              </Button>
            ) : null}
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(RoutePaths.STUDENT_EDIT.replace(':id', studentId))}
            >
              Sửa hồ sơ
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-slate-200 dark:border-[var(--border-subtle)]">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              '-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors',
              tab === t.key
                ? 'border-brand-600 text-brand-700 dark:border-brand-500 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-[var(--text-muted)] dark:hover:text-[var(--text-secondary)]',
            )}
          >
            {t.label}
            {t.key === 'enroll' ? (
              <span className="ml-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-600 dark:bg-[var(--bg-elevated)] dark:text-[var(--text-secondary)]">
                {enrollments.length}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {tab === 'enroll' && (
        <div className="space-y-4">
          {loadEnr ? (
            <p className="text-sm text-slate-500 dark:text-[var(--text-muted)]">Đang tải ghi danh…</p>
          ) : enrollments.length === 0 ? (
            <EmptyState
              title="Chưa có ghi danh nào"
              description="Thêm ghi danh vào lớp để theo dõi tiến độ, điểm danh và học phí."
              action={
                canAddEnrollment ? (
                  <Button type="button" onClick={() => setEnrollOpen(true)}>
                    Thêm ghi danh đầu tiên
                  </Button>
                ) : null
              }
            />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {enrollments.map((e) => (
                <EnrollmentCard key={e.id} enrollment={e} studentId={studentId} studentFullName={student.fullName} />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'attendance' && (
        <div className="space-y-4">
          {!activeEnrollment ? (
            <EmptyState
              title="Chưa có ghi danh đang hoạt động"
              description="Cần ghi danh đang hoạt động để xem lịch sử điểm danh theo buổi học."
              action={
                canAddEnrollment ? (
                  <Button type="button" onClick={() => setEnrollOpen(true)}>
                    Tạo ghi danh
                  </Button>
                ) : null
              }
            />
          ) : loadAtt ? (
            <p className="text-sm text-slate-500 dark:text-[var(--text-muted)]">Đang tải…</p>
          ) : (
            <>
              <div className="flex flex-wrap items-end gap-3">
                <div className="w-28">
                  <label className="mb-1 block text-xs text-slate-500 dark:text-[var(--text-muted)]">Buổi từ</label>
                  <input
                    type="number"
                    min={1}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-900 dark:border-[var(--border-default)] dark:bg-[var(--bg-surface)] dark:text-[var(--text-primary)]"
                    value={sessionMin}
                    onChange={(e) => setSessionMin(e.target.value)}
                    placeholder="#"
                  />
                </div>
                <div className="w-28">
                  <label className="mb-1 block text-xs text-slate-500 dark:text-[var(--text-muted)]">đến</label>
                  <input
                    type="number"
                    min={1}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-900 dark:border-[var(--border-default)] dark:bg-[var(--bg-surface)] dark:text-[var(--text-primary)]"
                    value={sessionMax}
                    onChange={(e) => setSessionMax(e.target.value)}
                    placeholder="#"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { id: 'all' as const, label: 'Tất cả' },
                    { id: 'present' as const, label: 'Có mặt' },
                    { id: 'absent' as const, label: 'Vắng' },
                  ] as const
                ).map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setAttFilter(b.id)}
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                      attFilter === b.id
                        ? 'border-brand-600 bg-brand-50 text-brand-800 dark:border-brand-500 dark:bg-brand-500/10 dark:text-brand-200'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-[var(--border-default)] dark:bg-[var(--bg-surface)] dark:text-[var(--text-secondary)]',
                    )}
                  >
                    {b.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-[var(--border-subtle)] dark:bg-[var(--bg-elevated)]">
                <span className="text-slate-500 dark:text-[var(--text-muted)]">Trong bộ lọc: {attSummary.total}</span>
                <span className="text-emerald-600 dark:text-emerald-400">Có mặt: {attSummary.p}</span>
                <span className="text-amber-600 dark:text-amber-400">Muộn: {attSummary.l}</span>
                <span className="text-blue-600 dark:text-blue-400">Vắng CP: {attSummary.a}</span>
                <span className="text-red-600 dark:text-red-400">Vắng KP: {attSummary.u}</span>
              </div>
              <div className="flex justify-end">
                <Button type="button" variant="secondary" size="sm" onClick={exportAttendanceHistory}>
                  Export to Excel
                </Button>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-[var(--border-subtle)] dark:bg-[var(--bg-base)]">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[var(--border-subtle)]">
                      {attendancePivot.map((c) => (
                        <th key={c.sessionNo} className="px-2 py-2 text-center text-[var(--text-muted)]">
                          {c.sessionNo}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {attendancePivot.map((c) => {
                        const st = c.row?.status;
                        const letter = attendanceCellLetter(st);
                        const cls =
                          st === ATTENDANCE_STATUS.present || st === ATTENDANCE_STATUS.late
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : st === ATTENDANCE_STATUS.absent_excused
                              ? 'bg-red-500/20 text-red-300'
                              : st === ATTENDANCE_STATUS.absent_unexcused
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'text-[var(--text-muted)]';
                        return (
                          <td key={c.sessionNo} className="px-2 py-2 text-center">
                            <button
                              type="button"
                              className={cn('inline-flex min-w-[22px] items-center justify-center rounded px-1 py-0.5', cls)}
                              onClick={() => c.row?.note && window.alert(c.row.note)}
                              title={c.row?.note ?? ''}
                            >
                              {letter || ' '}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-[var(--border-subtle)] dark:bg-[var(--bg-base)]">
                <table className="min-w-full divide-y divide-slate-100 text-sm dark:divide-[var(--border-subtle)]">
                  <thead className="bg-slate-50 dark:bg-[var(--bg-surface)]">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-[var(--text-muted)]">
                        Buổi #
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-[var(--text-muted)]">
                        Ngày
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-[var(--text-muted)]">Ca</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-[var(--text-muted)]">
                        Trạng thái
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-[var(--text-muted)]">
                        Ghi chú
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 dark:text-[var(--text-muted)]">
                        Học bù
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[var(--border-subtle)]">
                    {filteredAttendance.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-500 dark:text-[var(--text-muted)]">
                          {history.length === 0
                            ? 'Chưa điểm danh buổi học nào.'
                            : 'Không có dòng nào khớp bộ lọc.'}
                        </td>
                      </tr>
                    ) : (
                      filteredAttendance.map((row) => {
                        const st = (row.status ?? '').toLowerCase();
                        const canRowMakeup =
                          canAcademic &&
                          !activeEnrollment?.makeupBlocked &&
                          st === ATTENDANCE_STATUS.absent_excused;
                        const ca =
                          row.shiftLabel && row.timeRange
                            ? `${row.shiftLabel} (${row.timeRange})`
                            : row.shiftLabel || row.timeRange || null;
                        return (
                          <tr key={row.id}>
                            <td className="px-4 py-2 font-mono text-slate-800 dark:text-[var(--text-primary)]">
                              {row.sessionNo != null ? row.sessionNo : (
                                <span className="italic text-slate-400">{EMPTY_PLACEHOLDER}</span>
                              )}
                            </td>
                            <td className="px-4 py-2 text-slate-800 dark:text-[var(--text-primary)]">
                              {row.sessionDate ? formatDateWithWeekday(row.sessionDate) : (
                                <PlaceholderText value={null} />
                              )}
                            </td>
                            <td className="max-w-[200px] px-4 py-2 text-slate-700 dark:text-[var(--text-secondary)]">
                              {ca ? (
                                <span title={ca}>{ca}</span>
                              ) : (
                                <PlaceholderText value={null} />
                              )}
                            </td>
                            <td className="px-4 py-2">
                              <SessionBadge status={row.status} />
                            </td>
                            <td className="max-w-xs px-4 py-2 text-slate-600 dark:text-[var(--text-secondary)]">
                              {row.note?.trim() ? (
                                <ExpandableText text={row.note} className="text-sm" />
                              ) : (
                                <PlaceholderText value={null} />
                              )}
                            </td>
                            <td className="px-4 py-2 text-right">
                              {canRowMakeup ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => {
                                    setMakeupPrefillAttendanceId(row.id);
                                    setMakeupOpen(true);
                                  }}
                                >
                                  Tạo học bù
                                </Button>
                              ) : null}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {tab === 'makeup' && (
        <div className="space-y-4">
          {!activeEnrollment ? (
            <EmptyState
              title="Chưa có ghi danh đang hoạt động"
              description="Cần ghi danh đang hoạt động để đăng ký buổi học bù."
              action={
                canAddEnrollment ? (
                  <Button type="button" onClick={() => setEnrollOpen(true)}>
                    Tạo ghi danh
                  </Button>
                ) : null
              }
            />
          ) : (
            <>
              {activeEnrollment.makeupBlocked ? (
                <div className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/95">
                  Học bù bị khóa vì đã vắng không phép từ 3 lần trở lên
                </div>
              ) : null}
              <div className="flex justify-end gap-2">
                {canAcademic ? (
                  activeEnrollment.makeupBlocked ? (
                    <Tooltip content="Học bù bị khóa — không thể tạo buổi bù">
                      <span className="inline-flex cursor-not-allowed">
                        <Button type="button" disabled>
                          Tạo buổi học bù
                        </Button>
                      </span>
                    </Tooltip>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => {
                        setMakeupPrefillAttendanceId(null);
                        setMakeupOpen(true);
                      }}
                    >
                      Tạo buổi học bù
                    </Button>
                  )
                ) : null}
              </div>
              {loadMu ? (
                <p className="text-sm text-[var(--text-muted)]">Đang tải…</p>
              ) : makeupItems.length === 0 ? (
                <EmptyState title="Không có buổi học bù" description="Khi có buổi vắng có phép, bạn có thể tạo lịch học bù từ tab Điểm danh." />
              ) : (
                <ul className="space-y-3">
                  {makeupItems.map((m) => (
                    <li
                      key={m.id}
                      className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-3"
                    >
                      <div className="min-w-0 flex-1 text-sm">
                        <p className="font-medium text-[var(--text-primary)]">
                          Buổi #{m.originalSessionNo ?? '—'} — {m.originalDate ?? '—'}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[var(--text-muted)]">
                          <ArrowRight className="size-4 shrink-0" aria-hidden />
                          <span>
                            Bù {m.scheduledDate ?? '—'}
                            {m.roomName ? ` · ${m.roomName}` : ''}
                            {m.teacherName ? ` · ${m.teacherName}` : ''}
                          </span>
                        </div>
                      </div>
                      <Badge variant={m.status === 'pending' ? 'warning' : m.status === 'completed' ? 'success' : 'default'}>
                        {m.status}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      )}

      {tab === 'finance' && (
        <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-sm dark:border-[var(--border-subtle)] dark:bg-[var(--bg-elevated)] dark:text-[var(--text-secondary)]">
          <p className="text-slate-500 dark:text-[var(--text-secondary)]">
            Học phí còn lại và phiếu thu theo ghi danh đang hoạt động.
          </p>
          {activeEnrollment ? (
            <>
              {loadFinanceDebt ? (
                <p className="text-slate-500 dark:text-[var(--text-muted)]">Đang tải…</p>
              ) : debtSummary ? (
                <>
                  <DebtIndicator
                    tuitionFee={debtSummary.tuitionFee}
                    totalPaid={debtSummary.totalPaid}
                    debt={debtSummary.debt}
                  />
                  <div>
                    <h3 className="mb-2 font-medium text-slate-900 dark:text-[var(--text-primary)]">Phiếu thu</h3>
                    {!debtSummary.receipts || debtSummary.receipts.length === 0 ? (
                      <EmptyState
                        className="py-8"
                        title="Chưa có phiếu thu"
                        description="Chưa có phiếu thu nào cho học viên này"
                      />
                    ) : (
                      <ul className="space-y-2">
                        {[...debtSummary.receipts].sort((a, b) => {
                          const da = a.paymentDate ?? a.createdAt ?? '';
                          const db = b.paymentDate ?? b.createdAt ?? '';
                          return String(db).localeCompare(String(da));
                        }).map((r) => {
                          const voided = Boolean(r.voidedByReceiptId);
                          const pos = r.amount >= 0;
                          return (
                            <li
                              key={r.id}
                              className={cn(
                                'rounded-lg border border-slate-100 px-3 py-2 dark:border-[var(--border-subtle)]',
                                voided && 'opacity-75',
                              )}
                            >
                              <div className="flex flex-wrap items-baseline justify-between gap-2">
                                <Link
                                  to={RoutePaths.RECEIPT_DETAIL.replace(':id', r.id)}
                                  className={cn(
                                    'font-mono text-sm font-medium text-brand-700 hover:underline dark:text-brand-400',
                                    voided && 'line-through',
                                  )}
                                >
                                  {r.receiptCode}
                                  {voided ? ' (Đã hủy)' : ''}
                                </Link>
                                <span
                                  className={cn(
                                    'font-semibold tabular-nums',
                                    pos ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400',
                                  )}
                                >
                                  {pos ? '+' : ''}
                                  {formatVnd(r.amount)}
                                </span>
                              </div>
                              <p className="mt-1 text-xs text-slate-500 dark:text-[var(--text-muted)]">
                                {r.paymentDate ? formatDate(r.paymentDate) : displayText(r.createdAt, '—')} ·{' '}
                                {r.paymentMethod === 'transfer' || r.paymentMethod === 'bank_transfer'
                                  ? 'Chuyển khoản'
                                  : r.paymentMethod === 'cash'
                                    ? 'Tiền mặt'
                                    : r.paymentMethod}{' '}
                                · Người lập: {displayText(r.createdBy, EMPTY_PLACEHOLDER)}
                              </p>
                              {r.amountInWords ? (
                                <p className="mt-1 text-sm text-slate-800 dark:text-[var(--text-primary)]">{r.amountInWords}</p>
                              ) : null}
                              {r.reason?.trim() ? (
                                <div className="mt-1">
                                  <ExpandableText text={r.reason} className="text-xs text-slate-600 dark:text-[var(--text-secondary)]" />
                                </div>
                              ) : null}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-slate-500 dark:text-[var(--text-muted)]">Không lấy được dữ liệu học phí.</p>
              )}
            </>
          ) : (
            <EmptyState
              title="Không có ghi danh đang hoạt động"
              description="Cần ghi danh để xem học phí và phiếu thu."
              action={
                canAddEnrollment ? (
                  <Button type="button" onClick={() => setEnrollOpen(true)}>
                    Tạo ghi danh
                  </Button>
                ) : null
              }
            />
          )}
          {financeHref ? (
            <Link
              to={financeHref}
              className="inline-block font-medium text-brand-700 hover:underline dark:text-brand-400"
            >
              Mở trang tài chính chi tiết →
            </Link>
          ) : null}
        </div>
      )}

      <Modal
        isOpen={enrollOpen}
        onClose={() => {
          setEnrollOpen(false);
          setProgramId('');
          setClassId('');
          setUnavailableDays([]);
          setScheduleAcknowledged(false);
          setEnrollmentStatus('pending');
          setReservationFee('');
        }}
        title="Thêm ghi danh"
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setEnrollOpen(false);
                setProgramId('');
                setClassId('');
                setUnavailableDays([]);
                setScheduleAcknowledged(false);
                setEnrollmentStatus('pending');
                setReservationFee('');
              }}
              disabled={createEnr.isPending}
            >
              Hủy
            </Button>
            <Button
              type="button"
              isLoading={createEnr.isPending}
              disabled={!isUuid(classId) || !studentId || !scheduleAcknowledged}
              onClick={async () => {
                await createEnr.mutateAsync({
                  studentId,
                  classId: classId.trim(),
                  status: enrollmentStatus,
                  ...(enrollmentStatus === 'reserved' && reservationFee.trim()
                    ? { reservationFee: Number(reservationFee) }
                    : {}),
                });
                setEnrollOpen(false);
                setProgramId('');
                setClassId('');
                setUnavailableDays([]);
                setScheduleAcknowledged(false);
                setEnrollmentStatus('pending');
                setReservationFee('');
                void refetchEnr();
                void refetchStudent();
              }}
            >
              Tạo ghi danh
            </Button>
          </>
        }
      >
        <FormSelect
          label="Trạng thái ban đầu"
          options={[
            { value: 'pending', label: 'pending' },
            { value: 'trial', label: 'trial' },
            { value: 'reserved', label: 'reserved' },
          ]}
          value={enrollmentStatus}
          onChange={(e) => setEnrollmentStatus(e.target.value as 'reserved' | 'pending' | 'trial')}
        />
        {enrollmentStatus === 'reserved' ? (
          <div className="mt-3">
            <p className="mb-2 text-sm text-[var(--text-secondary)]">
              Phí giữ chỗ = 20% học phí (tự tính nếu để trống). Tạo phiếu thu sau ghi danh.
            </p>
            <label className="mb-1 block text-sm">Phí giữ chỗ (VND, tuỳ chọn)</label>
            <input
              type="number"
              min={1}
              className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2 text-sm"
              value={reservationFee}
              onChange={(e) => setReservationFee(e.target.value)}
              placeholder="Để trống = 20% học phí"
            />
          </div>
        ) : null}
        <FormSelect
          label="Chương trình"
          options={programOptions}
          value={programId}
          onChange={(e) => {
            setProgramId(e.target.value);
            setClassId('');
            setScheduleAcknowledged(false);
          }}
        />
        {loadClasses ? (
          <p className="mt-2 text-sm text-[var(--text-muted)]">Đang tải lớp…</p>
        ) : (
          <div className="mt-3">
            <div className="mb-3">
              <p className="mb-1 text-xs text-[var(--text-muted)]">Ngày không học được</p>
              <div className="flex flex-wrap gap-2">
                {[2, 3, 4, 5, 6, 7].map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={cn(
                      'rounded-full border px-2 py-1 text-xs',
                      unavailableDays.includes(d)
                        ? 'border-brand-500 bg-brand-500/10 text-brand-300'
                        : 'border-[var(--border-default)] text-[var(--text-secondary)]',
                    )}
                    onClick={() =>
                      setUnavailableDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()))
                    }
                  >
                    Thứ {d}
                  </button>
                ))}
              </div>
            </div>
            <FormSelect
              label="Lớp"
              options={classOptions.map((opt) => {
                if (!opt.value || unavailableDays.length === 0) return opt;
                const isSuggested = suggestedClassIds.has(opt.value);
                return { ...opt, label: isSuggested ? `⭐ ${opt.label}` : opt.label };
              })}
              value={classId}
              onChange={(e) => {
                setClassId(e.target.value);
                setScheduleAcknowledged(false);
              }}
              disabled={!programId}
            />
            {selectedClassForEnroll ? (
              <div className="mt-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)]/40 px-3 py-2 text-xs text-[var(--text-secondary)]">
                <p className="font-medium text-[var(--text-primary)]">Lịch lớp đã chọn</p>
                <p className="mt-1">
                  {scheduleDays(selectedClassForEnroll.scheduleDays)} · Ca{' '}
                  {Number(selectedClassForEnroll.shift) === 1 ? 'sáng (1)' : 'chiều (2)'}
                </p>
              </div>
            ) : null}
            {classId ? (
              <label className="mt-3 flex cursor-pointer items-start gap-2 text-sm text-[var(--text-secondary)]">
                <input
                  type="checkbox"
                  className="mt-1 size-4 shrink-0 rounded border-[var(--border-default)]"
                  checked={scheduleAcknowledged}
                  onChange={(ev) => setScheduleAcknowledged(ev.target.checked)}
                />
                <span>
                  Phụ huynh đã được giải thích lịch cố định của lớp (không có lịch riêng từng em) và đồng ý theo lớp
                  này — Q16.
                </span>
              </label>
            ) : null}
            {unavailableDays.length > 0 ? (
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                {suggestionsQuery.isLoading ? 'Đang tải lớp gợi ý...' : 'Đã hiển thị đánh dấu lớp gợi ý phù hợp hơn'}
              </p>
            ) : null}
            {suggestionsQuery.data?.hint ? (
              <p className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">{suggestionsQuery.data.hint}</p>
            ) : null}
          </div>
        )}
      </Modal>

      <MakeupModal
        isOpen={makeupOpen}
        onClose={() => {
          setMakeupOpen(false);
          setMakeupPrefillAttendanceId(null);
        }}
        makeupBlocked={activeEnrollment?.makeupBlocked}
        makeupBlockedReason="Học bù bị khóa vì đã vắng không phép từ 3 lần trở lên"
        initialAttendanceId={makeupPrefillAttendanceId}
        maxMakeupDate={maxMakeupDate}
        eligibleAttendances={eligibleMakeupAttendances}
        isSubmitting={createMakeup.isPending}
        onSubmit={async (body) => {
          await createMakeup.mutateAsync({
            ...body,
            enrollmentId: activeEnrollment?.id,
            studentId,
          });
          setMakeupOpen(false);
          void refetchMakeup();
        }}
      />
    </div>
  );
}
