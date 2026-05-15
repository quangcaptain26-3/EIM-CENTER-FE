import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { FormSelect } from '@/shared/ui/form/form-select';
import { Input } from '@/shared/ui/input';
import { StatusBadge } from '@/presentation/components/common/status-badge';
import { RoutePaths } from '@/app/router/route-paths';
import { useClass, useClassRoster } from '@/presentation/hooks/classes/use-classes';
import { useStudent, useStudentEnrollments, useStudents } from '@/presentation/hooks/students/use-students';
import { useCreateEnrollment } from '@/presentation/hooks/students/use-enrollment-mutations';
import { usePermission } from '@/presentation/hooks/use-permission';
import { ENROLLMENT_STATUS } from '@/shared/constants/statuses';
import { getScheduleConflictCheck } from '@/infrastructure/services/students.api';
import { scheduleDays } from '@/shared/lib/date';
import { cn } from '@/shared/lib/cn';
import { QUERY_KEYS } from '@/infrastructure/query/query-keys';
import { toastApiError } from '@/presentation/hooks/toast-api-error';
import { isUuid, pickUuid } from '@/shared/lib/uuid';
import { toast } from 'sonner';
import type { ClassDetail } from '@/shared/types/class.type';
import type { EnrollmentCardModel, StudentListItem } from '@/shared/types/student.type';

const BLOCKING_ENROLLMENT = new Set<string>([
  ENROLLMENT_STATUS.trial,
  ENROLLMENT_STATUS.active,
  ENROLLMENT_STATUS.paused,
]);

const ROSTER_OCCUPIED = new Set<string>([
  ENROLLMENT_STATUS.trial,
  ENROLLMENT_STATUS.active,
  ENROLLMENT_STATUS.paused,
]);

function norm(s: string | undefined | null) {
  return String(s ?? '').toLowerCase();
}

function isBlockingEnrollment(e: EnrollmentCardModel) {
  return BLOCKING_ENROLLMENT.has(norm(e.status));
}

function shiftLabel(c: ClassDetail) {
  if (c.shiftLabel?.trim()) return c.shiftLabel.trim();
  const sh = c.shift != null ? String(c.shift) : '';
  if (sh === 'SHIFT_1' || sh === '1') return 'Ca 1 (sáng)';
  if (sh === 'SHIFT_2' || sh === '2') return 'Ca 2 (chiều)';
  return sh || '—';
}

export default function ClassEnrollStudentPage() {
  const { classId: classIdParam } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const qc = useQueryClient();
  const { canManageAcademicEnrollment: canEnroll } = usePermission();

  const { classDetail, isLoading: classLoading, error: classError } = useClass(classIdParam);
  const { roster, isLoading: rosterLoading } = useClassRoster(classIdParam);

  /** UUID lớp — ưu tiên từ API (classInfo), fallback param URL */
  const resolvedClassId = useMemo(
    () => pickUuid(classDetail?.id, classIdParam),
    [classDetail?.id, classIdParam],
  );

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  useEffect(() => {
    const sid = searchParams.get('studentId');
    if (sid?.match(/^[0-9a-f-]{36}$/i)) {
      setSelectedStudentId(sid);
    } else {
      setSelectedStudentId(null);
    }
  }, [searchParams]);

  const programId = classDetail?.programId?.trim() || undefined;

  const [listScope, setListScope] = useState<'unassigned' | 'all'>('unassigned');

  const { students, total, isLoading: studentsLoading } = useStudents({
    page: 1,
    limit: 80,
    isActive: true,
    withoutActiveEnrollment: listScope === 'unassigned',
    search: debouncedSearch || undefined,
  });

  const rosterOccupiedIds = useMemo(() => {
    const set = new Set<string>();
    for (const r of roster) {
      if (ROSTER_OCCUPIED.has(norm(r.status))) {
        set.add(r.studentId);
      }
    }
    return set;
  }, [roster]);

  const visibleStudents = useMemo(() => {
    return students.filter((s) => {
      if (!isUuid(s.id)) return false;
      if (rosterOccupiedIds.has(s.id)) return false;
      if (listScope === 'all' && BLOCKING_ENROLLMENT.has(norm(s.enrollmentStatus))) {
        return false;
      }
      return true;
    });
  }, [students, rosterOccupiedIds, listScope]);

  const { student: selectedStudentDetail } = useStudent(selectedStudentId ?? undefined);
  const { enrollments, isLoading: enrollmentsLoading } = useStudentEnrollments(selectedStudentId ?? undefined);

  const hasBlockingEnrollmentElsewhere = useMemo(
    () => enrollments.some((e) => isBlockingEnrollment(e)),
    [enrollments],
  );

  const [enrollmentStatus, setEnrollmentStatus] = useState<'reserved' | 'pending' | 'trial'>('pending');
  const [reservationFee, setReservationFee] = useState('');
  const [unavailableDays, setUnavailableDays] = useState<number[]>([]);
  const [scheduleAcknowledged, setScheduleAcknowledged] = useState(false);

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

  const createEnr = useCreateEnrollment();

  const maxCap = classDetail?.maxCapacity ?? classDetail?.maxEnrollment ?? 12;
  const enrolled = classDetail?.enrollmentCount ?? 0;
  const isClassFull = enrolled >= maxCap;
  const classAcceptsEnrollment = classDetail && ['pending', 'active'].includes(norm(classDetail.status));

  const selectStudent = (id: string) => {
    setSelectedStudentId(id);
    setScheduleAcknowledged(false);
    setUnavailableDays([]);
    setEnrollmentStatus('pending');
    setReservationFee('');
    const next = new URLSearchParams(searchParams);
    next.set('studentId', id);
    setSearchParams(next, { replace: true });
  };

  const clearSelection = () => {
    setSelectedStudentId(null);
    setScheduleAcknowledged(false);
    const next = new URLSearchParams(searchParams);
    next.delete('studentId');
    setSearchParams(next, { replace: true });
  };

  const scheduleSummary = useMemo(() => {
    if (!classDetail) return '';
    const days = classDetail.scheduleDays?.length
      ? scheduleDays(classDetail.scheduleDays)
      : classDetail.scheduleLabel?.trim() || '—';
    return `${days} · ${shiftLabel(classDetail)}`;
  }, [classDetail]);

  const returnToEnrollPath = resolvedClassId
    ? RoutePaths.CLASS_ENROLL_STUDENT.replace(':classId', resolvedClassId)
    : '';

  const onSubmitEnroll = async () => {
    if (!resolvedClassId || !selectedStudentId || !scheduleAcknowledged) {
      if (!resolvedClassId) {
        toast.error('Không xác định được mã lớp (UUID). Vui lòng quay lại chi tiết lớp và thử lại.');
      }
      return;
    }
    if (!isUuid(selectedStudentId)) {
      toast.error('Học viên không hợp lệ.');
      return;
    }
    try {
      await createEnr.mutateAsync({
        studentId: selectedStudentId,
        classId: resolvedClassId,
        status: enrollmentStatus,
        ...(enrollmentStatus === 'reserved' && reservationFee.trim()
          ? { reservationFee: Number(reservationFee) }
          : {}),
      });
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.CLASSES.roster(resolvedClassId) });
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.CLASSES.detail(resolvedClassId) });
      navigate(`${RoutePaths.CLASS_DETAIL.replace(':classId', resolvedClassId)}?tab=roster`);
    } catch (e) {
      toastApiError(e);
    }
  };

  if (!classIdParam) {
    return (
      <div className="p-6">
        <p className="text-[var(--text-muted)]">Thiếu mã lớp.</p>
      </div>
    );
  }

  if (!canEnroll) {
    return (
      <div className="p-6">
        <p className="text-[var(--text-muted)]">Bạn không có quyền ghi danh.</p>
        <Button type="button" variant="secondary" className="mt-4" onClick={() => navigate(-1)}>
          Quay lại
        </Button>
      </div>
    );
  }

  if (classLoading && !classDetail) {
    return (
      <div className="p-6">
        <p className="text-[var(--text-muted)]">Đang tải lớp…</p>
      </div>
    );
  }

  if (classError || !classDetail || !resolvedClassId) {
    return (
      <div className="p-6">
        <p className="text-[var(--text-muted)]">Không tải được thông tin lớp.</p>
        <Button type="button" variant="secondary" className="mt-4" onClick={() => navigate(RoutePaths.CLASSES)}>
          Danh sách lớp
        </Button>
      </div>
    );
  }

  const selectedStudent = students.find((s) => s.id === selectedStudentId) ?? null;
  const selectedDisplayName = selectedStudent?.fullName ?? selectedStudentDetail?.fullName ?? null;
  const selectedDisplayCode = selectedStudent?.studentCode ?? selectedStudentDetail?.studentCode ?? null;

  const submitDisabled =
    !resolvedClassId ||
    !selectedStudentId ||
    !scheduleAcknowledged ||
    hasBlockingEnrollmentElsewhere ||
    isClassFull ||
    !classAcceptsEnrollment ||
    createEnr.isPending;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Thêm học viên vào lớp</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            <span className="font-mono font-medium text-[var(--text-primary)]">{classDetail.classCode}</span>
            {classDetail.programName ? ` · ${classDetail.programName}` : null}
            <span className="text-[var(--text-muted)]">
              {' '}
              — Sĩ số {enrolled}/{maxCap}
            </span>
          </p>
          {!classAcceptsEnrollment ? (
            <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
              Lớp không ở trạng thái nhận học viên (pending/active).
            </p>
          ) : null}
          {isClassFull ? (
            <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">Lớp đã đủ sĩ số.</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" asChild>
            <Link to={RoutePaths.CLASS_DETAIL.replace(':classId', resolvedClassId)}>← Chi tiết lớp</Link>
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">
        <p className="text-sm font-medium text-[var(--text-primary)]">Chọn học viên có sẵn trên hệ thống</p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Mặc định chỉ hiện học viên chưa có lớp (không đang học trial/active/paused ở lớp khác). Đã ẩn học viên đang có
          trên sổ lớp này.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              listScope === 'unassigned'
                ? 'border-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-300'
                : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-base)]',
            )}
            onClick={() => setListScope('unassigned')}
          >
            Chưa có lớp
          </button>
          <button
            type="button"
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              listScope === 'all'
                ? 'border-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-300'
                : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-base)]',
            )}
            onClick={() => setListScope('all')}
          >
            Tất cả học viên
          </button>
        </div>
        <div className="mt-3 max-w-md">
          <Input
            placeholder="Tên, mã HV, SĐT phụ huynh…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <div className="mt-4 max-h-72 overflow-y-auto rounded-lg border border-[var(--border-subtle)]">
          {studentsLoading || rosterLoading ? (
            <p className="p-4 text-sm text-[var(--text-muted)]">Đang tải…</p>
          ) : visibleStudents.length === 0 ? (
            <p className="p-4 text-sm text-[var(--text-muted)]">
              {listScope === 'unassigned'
                ? 'Không có học viên nào chưa có lớp (hoặc đã có trên sổ lớp này).'
                : 'Không tìm thấy học viên phù hợp.'}
            </p>
          ) : (
            <ul className="divide-y divide-[var(--border-subtle)]">
              {visibleStudents.map((s: StudentListItem) => (
                <li key={s.id}>
                  <button
                    type="button"
                    className={cn(
                      'flex w-full flex-col items-start gap-0.5 px-3 py-2.5 text-left text-sm transition-colors',
                      selectedStudentId === s.id
                        ? 'bg-brand-500/10 text-[var(--text-primary)]'
                        : 'hover:bg-[var(--bg-base)]',
                    )}
                    onClick={() => selectStudent(s.id)}
                  >
                    <span className="font-medium">{s.fullName}</span>
                    <span className="text-xs text-[var(--text-muted)]">
                      {s.studentCode}
                      {s.parentPhone ? ` · ${s.parentPhone}` : null}
                      {s.activeClassCode ? ` · Đang học lớp ${s.activeClassCode}` : ' · Chưa có lớp'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {total > visibleStudents.length ? (
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            Hiển thị tối đa 80 / {total} học viên{listScope === 'unassigned' ? ' chưa có lớp' : ''}.
          </p>
        ) : null}
        {returnToEnrollPath ? (
          <p className="mt-3 text-xs text-[var(--text-muted)]">
            Không thấy trong danh sách?{' '}
            <Link
              to={`${RoutePaths.STUDENT_NEW}?returnTo=${encodeURIComponent(returnToEnrollPath)}`}
              className="font-medium text-brand-600 hover:underline dark:text-brand-400"
            >
              Tạo hồ sơ học viên mới
            </Link>{' '}
            rồi quay lại trang này để ghi danh.
          </p>
        ) : null}
      </div>

      {selectedStudentId ? (
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-[var(--text-primary)]">
              Đã chọn: {selectedDisplayName ?? '…'}{' '}
              <span className="font-mono text-[var(--text-muted)]">{selectedDisplayCode ?? ''}</span>
            </p>
            <Button type="button" variant="ghost" size="sm" onClick={clearSelection}>
              Bỏ chọn
            </Button>
          </div>

          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
              Ghi danh hiện có của học viên
            </p>
            {enrollmentsLoading ? (
              <p className="mt-2 text-sm text-[var(--text-muted)]">Đang tải…</p>
            ) : enrollments.length === 0 ? (
              <p className="mt-2 text-sm text-[var(--text-muted)]">Chưa có ghi danh nào.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {enrollments.map((e: EnrollmentCardModel) => (
                  <li
                    key={e.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--border-subtle)] px-3 py-2 text-sm"
                  >
                    <span>
                      {e.classCode ?? e.className ?? 'Lớp'}{' '}
                      <span className="text-[var(--text-muted)]">· {e.programName ?? e.programCode ?? ''}</span>
                    </span>
                    <StatusBadge domain="enrollment" status={String(e.status ?? '')} />
                  </li>
                ))}
              </ul>
            )}
            {hasBlockingEnrollmentElsewhere ? (
              <p className="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-800 dark:text-amber-200">
                Học viên đang có ghi danh trial, active hoặc paused — không thể tạo ghi danh mới cho đến khi xử lý
                xong (chuyển lớp / nghỉ / hoàn tất…).
              </p>
            ) : null}
          </div>

          <div className="mt-6 space-y-4 border-t border-[var(--border-subtle)] pt-4">
            <FormSelect
              label="Trạng thái ban đầu"
              options={[
                { value: 'pending', label: 'pending' },
                { value: 'trial', label: 'trial' },
                { value: 'reserved', label: 'reserved' },
              ]}
              value={enrollmentStatus}
              onChange={(ev) => setEnrollmentStatus(ev.target.value as 'reserved' | 'pending' | 'trial')}
            />
            {enrollmentStatus === 'reserved' ? (
              <div>
                <label className="mb-1 block text-sm">Phí giữ chỗ (VND)</label>
                <input
                  type="number"
                  min={1}
                  className="w-full max-w-xs rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2 text-sm"
                  value={reservationFee}
                  onChange={(ev) => setReservationFee(ev.target.value)}
                />
              </div>
            ) : null}

            <div>
              <p className="mb-1 text-xs text-[var(--text-muted)]">Ngày trong tuần không học được (tuỳ chọn — gợi ý lớp)</p>
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
                      setUnavailableDays((prev) =>
                        prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort(),
                      )
                    }
                  >
                    Thứ {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)]/40 px-3 py-2 text-sm text-[var(--text-secondary)]">
              <p className="font-medium text-[var(--text-primary)]">Lịch lớp này</p>
              <p className="mt-1">{scheduleSummary}</p>
              {unavailableDays.length > 0 && programId && !suggestedClassIds.has(resolvedClassId) ? (
                <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                  Theo ngày không học được đã chọn, lớp này không nằm trong danh sách gợi ý — vẫn có thể ghi danh nếu
                  phụ huynh đồng ý lịch cố định.
                </p>
              ) : null}
              {suggestionsQuery.data?.hint ? (
                <p className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">{suggestionsQuery.data.hint}</p>
              ) : null}
            </div>

            <label className="flex cursor-pointer items-start gap-2 text-sm text-[var(--text-secondary)]">
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

            <div className="flex flex-wrap gap-3 pt-2">
              <Button type="button" isLoading={createEnr.isPending} disabled={submitDisabled} onClick={onSubmitEnroll}>
                Ghi danh vào lớp
              </Button>
              <Button type="button" variant="secondary" asChild>
                <Link to={RoutePaths.STUDENT_DETAIL.replace(':id', selectedStudentId)}>Mở hồ sơ học viên</Link>
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
