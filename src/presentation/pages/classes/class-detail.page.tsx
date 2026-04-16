import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { FormSelect } from '@/shared/ui/form/form-select';
import { FormInput } from '@/shared/ui/form/form-input';
import { Modal } from '@/shared/ui/modal';
import { Tabs, type TabItem } from '@/shared/ui/tabs';
import { Avatar } from '@/shared/ui/avatar';
import { DataTable } from '@/shared/ui/data-table';
import { createColumnHelper } from '@tanstack/react-table';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { useClass, useClassRoster } from '@/presentation/hooks/classes/use-classes';
import { useClassSessions } from '@/presentation/hooks/sessions/use-sessions';
import { useReplaceTeacher, useCloseClass, useGenerateSessions } from '@/presentation/hooks/classes/use-class-mutations';
import { useUsers } from '@/presentation/hooks/system/use-users';
import { ClassSessionTimeline } from '@/presentation/components/classes/session-list';
import { StatusBadge } from '@/presentation/components/common/status-badge';
import { RoutePaths } from '@/app/router/route-paths';
import { formatDate } from '@/shared/lib/date';
import { ROLES } from '@/shared/constants/roles';
import { toast } from 'sonner';
import { usePermission } from '@/presentation/hooks/use-permission';
import { Tooltip } from '@/shared/ui/tooltip';
import { programPillClass } from '@/presentation/components/classes/program-theme';
import { cn } from '@/shared/lib/cn';
import type { RosterRow } from '@/shared/types/class.type';
import { fmt } from '@/shared/lib/fmt';

const replaceSchema = z.object({
  newTeacherId: z.string().min(1, 'Chọn GV mới'),
  reason: z.string().min(1, 'Nhập lý do'),
});

type TabId = 'sessions' | 'roster' | 'staff';

const rosterColumnHelper = createColumnHelper<RosterRow>();

export default function ClassDetailPage() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { canManageAcademicEnrollment: canAddStudent, canReplaceMainTeacher } = usePermission();
  const canManageSchedule = canAddStudent;

  const [tab, setTab] = useState<TabId>('sessions');
  const [replaceOpen, setReplaceOpen] = useState(false);
  const [closeConfirm, setCloseConfirm] = useState(false);
  const [generateSessionsOpen, setGenerateSessionsOpen] = useState(false);

  const { classDetail, isLoading, refetch: refetchClass } = useClass(classId);
  const { roster, isLoading: rosterLoading } = useClassRoster(classId);
  const {
    sessions,
    isLoading: sessionsLoading,
    refetch: refetchSessions,
  } = useClassSessions(classId);

  const { users: teachers } = useUsers({
    page: 1,
    limit: 200,
    role: ROLES.TEACHER,
    isActive: true,
  });

  const replaceM = useReplaceTeacher();
  const closeM = useCloseClass();
  const generateSessionsM = useGenerateSessions();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof replaceSchema>>({
    resolver: zodResolver(replaceSchema),
    defaultValues: { newTeacherId: '', reason: '' },
  });

  const teacherOptions = useMemo(
    () => teachers.map((t) => ({ value: t.id, label: `${t.fullName} (${t.userCode})` })),
    [teachers],
  );

  const onReplace = handleSubmit(async (v) => {
    if (!classId) return;
    try {
      await replaceM.mutateAsync({
        id: classId,
        body: { newTeacherId: v.newTeacherId, reason: v.reason },
      });
      toast.success('Đã cập nhật GV');
      setReplaceOpen(false);
      reset();
      void refetchClass();
      void refetchSessions();
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message ?? 'Thất bại');
    }
  });

  const tabs: TabItem[] = useMemo(
    () => [
      { id: 'sessions', label: 'Lịch học' },
      { id: 'roster', label: 'Học viên' },
      { id: 'staff', label: 'Giáo viên' },
    ],
    [],
  );

  const rosterColumns = useMemo(
    () => [
      rosterColumnHelper.display({
        id: 'student',
        header: 'Học viên',
        cell: (ctx) => {
          const r = ctx.row.original;
          return (
            <div className="flex items-center gap-2">
              <Avatar name={r.studentName} size="sm" />
              <span className="font-medium text-[var(--text-primary)]">{r.studentName}</span>
            </div>
          );
        },
      }),
      rosterColumnHelper.accessor('studentCode', {
        header: 'Mã HS',
        cell: (c) => <span className="font-mono text-[var(--text-secondary)]">{c.getValue() ?? '—'}</span>,
      }),
      rosterColumnHelper.accessor('status', {
        header: 'Trạng thái',
        cell: (c) => <StatusBadge domain="enrollment" status={String(c.getValue())} />,
      }),
      rosterColumnHelper.display({
        id: 'prog',
        header: 'Buổi',
        cell: (ctx) => {
          const r = ctx.row.original;
          const done = r.sessionsCompleted ?? 0;
          const tot = r.sessionsTotal ?? 24;
          return (
            <span className="tabular-nums text-[var(--text-secondary)]">
              {done}/{tot}
            </span>
          );
        },
      }),
      rosterColumnHelper.display({
        id: 'debt',
        header: 'Công nợ',
        cell: (ctx) => {
          const d = ctx.row.original.debtAmount;
          if (d == null || d === 0) {
            return <span className="text-green-400">✓</span>;
          }
          if (d > 0) {
            return <span className="text-red-400">Nợ {fmt.currencyShort(d)}</span>;
          }
          return '—';
        },
      }),
      rosterColumnHelper.display({
        id: 'link',
        header: '',
        cell: (ctx) => (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(RoutePaths.STUDENT_DETAIL.replace(':id', ctx.row.original.studentId));
            }}
          >
            Hồ sơ
          </Button>
        ),
      }),
    ],
    [navigate],
  );

  const canCloseClass =
    classDetail && (classDetail.status === 'active' || classDetail.status === 'pending');

  if (isLoading || !classId) {
    return <p className="text-sm text-[var(--text-muted)]">Đang tải…</p>;
  }

  if (!classDetail) {
    return (
      <div className="space-y-2">
        <p className="text-[var(--text-secondary)]">Không tìm thấy lớp.</p>
        <Button type="button" variant="secondary" onClick={() => navigate(RoutePaths.CLASSES)}>
          Quay lại
        </Button>
      </div>
    );
  }

  const c = classDetail;
  const maxCap = c.maxCapacity ?? 12;
  const isClassFull = (c.enrollmentCount ?? 0) >= maxCap;
  const capacityTooltip = `Lớp đã đủ ${maxCap} học viên`;
  const pillCls = programPillClass(c.programName);
  const showPendingNoSessionsBanner =
    c.status === 'pending' && !sessionsLoading && sessions.length === 0;

  return (
    <div className="space-y-6">
      <Button type="button" variant="ghost" size="sm" className="-ml-2 text-[var(--text-secondary)]" onClick={() => navigate(RoutePaths.CLASSES)}>
        ← Danh sách
      </Button>

      {showPendingNoSessionsBanner ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-amber-100/95">Lớp chưa có lịch học.</p>
          {canManageSchedule ? (
            <Button
              type="button"
              variant="outline"
              className="shrink-0 border-amber-500/50 text-amber-200 hover:bg-amber-500/15"
              onClick={() => setGenerateSessionsOpen(true)}
            >
              Sinh lịch học ngay →
            </Button>
          ) : null}
        </div>
      ) : null}

      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--text-primary)]">{c.classCode}</h1>
              {c.programName ? (
                <span className={cn('rounded-full border px-2.5 py-0.5 text-xs font-medium', pillCls)}>{c.programName}</span>
              ) : null}
              <Badge variant={c.status === 'active' ? 'success' : c.status === 'closed' ? 'default' : 'warning'}>
                {c.status}
              </Badge>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              {c.shiftLabel ?? '—'} · {c.scheduleLabel ?? '—'} · {c.roomName ?? '—'} · GV:{' '}
              <span className="text-[var(--text-primary)]">{c.mainTeacherName ?? '—'}</span> · Sĩ số {c.enrollmentCount ?? 0}/{maxCap}
            </p>
            {c.startDate ? (
              <p className="text-xs text-[var(--text-muted)]">Khai giảng: {formatDate(c.startDate)}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {canAddStudent ? (
              isClassFull ? (
                <Tooltip content={capacityTooltip}>
                  <span className="inline-flex cursor-not-allowed">
                    <Button type="button" disabled>
                      Thêm học viên
                    </Button>
                  </span>
                </Tooltip>
              ) : (
                <Button type="button" onClick={() => navigate(RoutePaths.STUDENT_NEW, { state: { classId } })}>
                  Thêm học viên
                </Button>
              )
            ) : null}
            {canReplaceMainTeacher ? (
              <Button type="button" variant="secondary" onClick={() => setReplaceOpen(true)}>
                Thay GV chính
              </Button>
            ) : null}
            {canCloseClass ? (
              <Button type="button" variant="outline" onClick={() => setCloseConfirm(true)}>
                Đóng lớp
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <Tabs variant="underline" tabs={tabs} activeTab={tab} onChange={(id) => setTab(id as TabId)} />

      {tab === 'sessions' ? (
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">
          <ClassSessionTimeline
            classId={classId}
            classCode={c.classCode}
            shiftLabel={c.shiftLabel}
            sessions={sessions}
            isLoading={sessionsLoading}
            canManageSchedule={canManageSchedule}
            onRefetch={() => void refetchSessions()}
          />
        </div>
      ) : null}

      {tab === 'roster' ? (
        <div className="space-y-3">
          {canAddStudent ? (
            <div className="flex justify-end">
              {isClassFull ? (
                <Tooltip content={capacityTooltip}>
                  <span className="inline-flex cursor-not-allowed">
                    <Button type="button" disabled>
                      Thêm học viên
                    </Button>
                  </span>
                </Tooltip>
              ) : (
                <Button type="button" onClick={() => navigate(RoutePaths.STUDENT_NEW, { state: { classId } })}>
                  Thêm học viên
                </Button>
              )}
            </div>
          ) : null}
          <DataTable
            columns={rosterColumns}
            data={roster}
            total={roster.length}
            page={1}
            pageSize={Math.max(roster.length, 1)}
            onPageChange={() => {}}
            isLoading={rosterLoading}
            emptyMessage="Chưa có học viên."
            getRowId={(r) => r.enrollmentId}
          />
        </div>
      ) : null}

      {tab === 'staff' ? (
        <div className="space-y-4">
          {canReplaceMainTeacher ? (
            <div className="flex justify-end">
              <Button type="button" onClick={() => setReplaceOpen(true)}>
                Thay GV chính
              </Button>
            </div>
          ) : null}
          <div className="relative border-l border-[var(--border-subtle)] pl-6">
            <ul className="space-y-6">
              {(c.teacherHistory?.length ? c.teacherHistory : []).map((h) => {
                const current = !h.effectiveTo;
                return (
                  <li key={h.id} className="relative">
                    <span
                      className={cn(
                        'absolute -left-[29px] top-1 size-3 rounded-full border-2 border-[var(--bg-surface)]',
                        current ? 'bg-brand-500' : 'bg-[var(--text-muted)]',
                      )}
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <Avatar name={h.teacherName} size="sm" />
                      <span className="font-medium text-[var(--text-primary)]">{h.teacherName}</span>
                      {current ? (
                        <Badge variant="brand" className="text-[10px]">
                          Hiện tại
                        </Badge>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                      {h.effectiveFrom ? formatDate(h.effectiveFrom) : '—'} → {h.effectiveTo ? formatDate(h.effectiveTo) : '—'}
                    </p>
                    {h.reason ? <p className="mt-1 text-xs text-[var(--text-muted)]">{h.reason}</p> : null}
                  </li>
                );
              })}
            </ul>
            {!c.teacherHistory?.length ? <p className="text-sm text-[var(--text-muted)]">Chưa có lịch sử phân công.</p> : null}
          </div>
        </div>
      ) : null}

      <Modal
        isOpen={replaceOpen}
        onClose={() => setReplaceOpen(false)}
        title="Thay giáo viên phụ trách"
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setReplaceOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" form="replace-teacher-form" isLoading={replaceM.isPending}>
              Lưu
            </Button>
          </>
        }
      >
        <form id="replace-teacher-form" className="space-y-3" onSubmit={onReplace}>
          <FormSelect
            label="Giáo viên mới"
            options={teacherOptions}
            {...register('newTeacherId')}
            error={errors.newTeacherId?.message}
          />
          <FormInput label="Lý do" {...register('reason')} error={errors.reason?.message} />
        </form>
      </Modal>

      <ConfirmDialog
        open={closeConfirm}
        onClose={() => setCloseConfirm(false)}
        title="Đóng lớp"
        message="Xác nhận đóng lớp này? Học viên đang học có thể bị ảnh hưởng."
        confirmLabel="Đóng lớp"
        loading={closeM.isPending}
        onConfirm={async () => {
          if (!classId) return;
          await closeM.mutateAsync(classId);
          toast.success('Đã đóng lớp');
          setCloseConfirm(false);
          void refetchClass();
        }}
      />

      <ConfirmDialog
        open={generateSessionsOpen}
        onClose={() => setGenerateSessionsOpen(false)}
        variant="warning"
        title="Sinh lịch học?"
        message={
          c.startDate
            ? `Hệ thống sẽ sinh các buổi học từ ngày khai giảng đã chọn (${formatDate(c.startDate)}), bỏ qua ngày lễ. Tiếp tục?`
            : 'Hệ thống sẽ sinh lịch buổi học (bỏ qua ngày lễ). Tiếp tục?'
        }
        confirmLabel="Sinh lịch học"
        cancelLabel="Hủy"
        loading={generateSessionsM.isPending}
        onConfirm={async () => {
          if (!classId || !c.startDate) {
            toast.error('Thiếu ngày khai giảng trên lớp — không sinh được lịch.');
            setGenerateSessionsOpen(false);
            return;
          }
          try {
            const result = await generateSessionsM.mutateAsync({
              id: classId,
              body: { startDate: c.startDate },
            });
            toast.success(
              `Đã sinh ${result.sessionsCreated} buổi học từ ${formatDate(result.firstDate)} đến ${formatDate(result.lastDate)}`,
            );
            setGenerateSessionsOpen(false);
            void refetchClass();
            void refetchSessions();
          } catch {
            /* toastApiError từ mutation */
          }
        }}
      />
    </div>
  );
}
