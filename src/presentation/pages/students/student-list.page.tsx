import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { DataTable } from '@/shared/ui/data-table';
import { FormSelect } from '@/shared/ui/form/form-select';
import { Avatar } from '@/shared/ui/avatar';
import { EnrollmentBadge } from '@/shared/ui/badge';
import { useStudentsList, useStudentSearchSuggestions } from '@/presentation/hooks/students/use-students';
import { useParsedPrograms } from '@/presentation/hooks/classes/use-classes';
import { useClassesList } from '@/presentation/hooks/classes/use-classes';
import { RoutePaths } from '@/app/router/route-paths';
import type { StudentListItem } from '@/shared/types/student.type';
import { programPillClass } from '@/presentation/components/classes/program-theme';
import { ENROLLMENT_STATUS } from '@/shared/constants/statuses';
import { cn } from '@/shared/lib/cn';

const LEVEL_OPTIONS = [
  { value: '', label: 'Tất cả cấp' },
  { value: 'Kindy', label: 'Kindy' },
  { value: 'Starters', label: 'Starters' },
  { value: 'Movers', label: 'Movers' },
  { value: 'Flyers', label: 'Flyers' },
];

const ENROLL_STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: ENROLLMENT_STATUS.pending, label: 'Chờ xử lý' },
  { value: ENROLLMENT_STATUS.trial, label: 'Học thử' },
  { value: ENROLLMENT_STATUS.active, label: 'Đang học' },
  { value: ENROLLMENT_STATUS.paused, label: 'Bảo lưu' },
  { value: ENROLLMENT_STATUS.completed, label: 'Hoàn thành' },
  { value: ENROLLMENT_STATUS.dropped, label: 'Nghỉ' },
  { value: ENROLLMENT_STATUS.transferred, label: 'Chuyển lớp' },
];

function isPhoneDigits(s: string): boolean {
  const t = s.replace(/\s/g, '');
  return /^\d{10,11}$/.test(t);
}

function isEimStudentCode(s: string): boolean {
  return /^EIM-HS-\d+$/i.test(s.trim());
}

export default function StudentListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const limit = 15;
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [suggestOpen, setSuggestOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const [programId, setProgramId] = useState('');
  const [level, setLevel] = useState('');
  const [enrollmentStatus, setEnrollmentStatus] = useState('');
  const [classId, setClassId] = useState('');

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  const listParams = useMemo(
    () => ({
      page,
      limit,
      search: debouncedSearch || undefined,
      programId: programId || undefined,
      level: level || undefined,
      enrollmentStatus: enrollmentStatus || undefined,
      classId: classId || undefined,
    }),
    [page, limit, debouncedSearch, programId, level, enrollmentStatus, classId],
  );

  const { students, total, isLoading } = useStudentsList(listParams);
  const { students: suggestStudents, byPhone: suggestByPhone, isLoading: suggestLoading } =
    useStudentSearchSuggestions(debouncedSearch, suggestOpen && debouncedSearch.length >= 1);

  const { programs } = useParsedPrograms();
  const { classes, isLoading: classesLoading } = useClassesList({
    page: 1,
    limit: 500,
    status: 'active',
  });

  const programOptions = useMemo(
    () => [{ value: '', label: 'Tất cả chương trình' }, ...programs.map((p) => ({ value: p.id, label: p.name }))],
    [programs],
  );

  const classOptions = useMemo(
    () => [
      { value: '', label: classesLoading ? 'Đang tải lớp…' : 'Tất cả lớp' },
      ...classes.map((c) => ({
        value: c.id,
        label: `${c.classCode}${c.programName ? ` · ${c.programName}` : ''}`,
      })),
    ],
    [classes, classesLoading],
  );

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setSuggestOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const pickSuggestion = useCallback(
    (id: string) => {
      setSuggestOpen(false);
      navigate(RoutePaths.STUDENT_DETAIL.replace(':id', id));
    },
    [navigate],
  );

  const displayStudents = useMemo(() => suggestStudents.slice(0, 5), [suggestStudents]);
  const showPhoneSection = isPhoneDigits(debouncedSearch);

  const columns: ColumnDef<StudentListItem>[] = useMemo(
    () => [
      {
        id: 'student',
        header: 'Học viên',
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar name={r.fullName} size="sm" />
              <div className="min-w-0">
                <p className="font-medium text-[var(--text-primary)]">{r.fullName}</p>
                <p className="font-mono text-xs text-[var(--text-muted)]">{r.studentCode}</p>
              </div>
            </div>
          );
        },
      },
      {
        id: 'class',
        header: 'Lớp',
        cell: ({ row }) => {
          const v = row.original.activeClassCode ?? row.original.currentClassName;
          return (
            <span className={v ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)]'}>
              {v ?? '—'}
            </span>
          );
        },
      },
      {
        id: 'level',
        header: 'Cấp độ',
        cell: ({ row }) => {
          const name =
            row.original.programName ??
            row.original.levelLabel ??
            row.original.currentLevel ??
            '';
          if (!name) return <span className="text-[var(--text-muted)]">—</span>;
          return (
            <span
              className={cn(
                'inline-flex rounded-full border px-2 py-0.5 text-xs font-medium',
                programPillClass(name),
              )}
            >
              {name}
            </span>
          );
        },
      },
      {
        id: 'parent',
        header: 'Phụ huynh',
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div>
              <p className="text-[var(--text-primary)]">{r.parentName ?? '—'}</p>
              <p className="font-mono text-xs text-[var(--text-muted)]">{r.parentPhone ?? '—'}</p>
            </div>
          );
        },
      },
      {
        id: 'status',
        header: 'Trạng thái',
        cell: ({ row }) => (
          <EnrollmentBadge status={row.original.enrollmentStatus ?? row.original.status} />
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-[var(--text-muted)] hover:text-[var(--accent)]"
            aria-label="Xem chi tiết"
            onClick={() => navigate(RoutePaths.STUDENT_DETAIL.replace(':id', row.original.id))}
          >
            <Eye className="size-5" />
          </Button>
        ),
      },
    ],
    [navigate],
  );

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Học viên</h1>
        <Button type="button" onClick={() => navigate(RoutePaths.STUDENT_NEW)}>
          Tạo học viên mới
        </Button>
      </div>

      <div ref={wrapRef} className="relative">
        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]">
          Tìm nhanh
        </label>
        <input
          type="search"
          autoComplete="off"
          placeholder="Tìm theo tên, mã HS, SĐT phụ huynh..."
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            setSuggestOpen(true);
            setPage(1);
          }}
          onFocus={() => setSuggestOpen(true)}
          className="w-full rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-3 text-base text-[var(--text-primary)] shadow-inner placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-subtle)] md:text-lg"
        />
        {isEimStudentCode(searchInput.trim()) ? (
          <p className="mt-1 text-xs text-brand-500">Khớp định dạng mã học viên (EIM-HS-…)</p>
        ) : isPhoneDigits(searchInput.trim()) ? (
          <p className="mt-1 text-xs text-sky-500">Đang tìm theo SĐT…</p>
        ) : null}

        {suggestOpen && debouncedSearch.length >= 1 && (
          <div
            className={cn(
              'absolute z-30 mt-2 max-h-80 w-full overflow-auto rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] py-2 shadow-[var(--shadow-lg)]',
              suggestLoading && 'px-3 py-4 text-sm text-[var(--text-muted)]',
            )}
          >
            {!suggestLoading && (
              <>
                <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]">
                  Học viên
                </div>
                {displayStudents.length === 0 ? (
                  <p className="px-3 pb-2 text-sm text-[var(--text-muted)]">Không có kết quả</p>
                ) : (
                  displayStudents.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-[var(--bg-subtle)]"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => pickSuggestion(s.id)}
                    >
                      <Avatar name={s.fullName} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-[var(--text-primary)]">{s.fullName}</p>
                        <p className="font-mono text-xs text-[var(--text-muted)]">{s.studentCode}</p>
                      </div>
                      <EnrollmentBadge status={s.enrollmentStatus ?? s.status} />
                    </button>
                  ))
                )}
                {showPhoneSection && suggestByPhone.length > 0 ? (
                  <>
                    <div className="mt-2 border-t border-[var(--border-subtle)] px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]">
                      Theo SĐT
                    </div>
                    {suggestByPhone.map((s) => (
                      <button
                        key={`ph-${s.id}`}
                        type="button"
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-[var(--bg-subtle)]"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => pickSuggestion(s.id)}
                      >
                        <Avatar name={s.fullName} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-[var(--text-primary)]">{s.fullName}</p>
                          <p className="font-mono text-xs text-[var(--text-muted)]">{s.studentCode}</p>
                        </div>
                        <EnrollmentBadge status={s.enrollmentStatus ?? s.status} />
                      </button>
                    ))}
                  </>
                ) : null}
              </>
            )}
            {suggestLoading ? <p className="text-sm text-[var(--text-muted)]">Đang tìm…</p> : null}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] p-4">
        <div className="min-w-[160px] flex-1">
          <FormSelect
            label="Chương trình"
            name="filter-program"
            options={programOptions}
            value={programId}
            onChange={(e) => {
              setProgramId(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="min-w-[140px] flex-1">
          <FormSelect
            label="Cấp độ"
            name="filter-level"
            options={LEVEL_OPTIONS}
            value={level}
            onChange={(e) => {
              setLevel(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="min-w-[160px] flex-1">
          <FormSelect
            label="Trạng thái ghi danh"
            name="filter-enrollment-status"
            options={ENROLL_STATUS_OPTIONS}
            value={enrollmentStatus}
            onChange={(e) => {
              setEnrollmentStatus(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="min-w-[200px] flex-2">
          <FormSelect
            label="Lớp hiện tại"
            name="filter-class"
            options={classOptions}
            value={classId}
            onChange={(e) => {
              setClassId(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={students}
        total={total}
        page={page}
        pageSize={limit}
        onPageChange={setPage}
        isLoading={isLoading}
        emptyMessage="Không có học viên phù hợp."
        getRowId={(r) => r.id}
      />
    </div>
  );
}
