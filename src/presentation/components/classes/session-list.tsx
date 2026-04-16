import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate, isTodayUtc7 } from '@/shared/lib/date';
import { StatusBadge } from '@/presentation/components/common/status-badge';
import { Button } from '@/shared/ui/button';
import { Avatar } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import { SESSION_STATUS } from '@/shared/constants/statuses';
import type { ClassSessionRow } from '@/shared/types/session.type';
import { RoutePaths } from '@/app/router/route-paths';
import { useAuth } from '@/presentation/hooks/auth/use-auth';
import { ROLES } from '@/shared/constants/roles';
import { cn } from '@/shared/lib/cn';
import { RescheduleModal, type RescheduleFormValues } from '@/presentation/components/classes/reschedule-modal';
import { CoverModal, type CoverFormValues } from '@/presentation/components/classes/cover-modal';
import {
  useAssignCover,
  useCancelCover,
  useRescheduleSession,
} from '@/presentation/hooks/sessions/use-session-mutations';
import { toast } from 'sonner';
import { Tooltip } from '@/shared/ui/tooltip';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import {
  ATTENDANCE_PERMISSION_TOOLTIP,
  attendanceDayBlockedTooltip,
} from '@/presentation/lib/attendance-access';

interface ClassSessionTimelineProps {
  classId: string;
  classCode?: string;
  shiftLabel?: string;
  sessions: ClassSessionRow[];
  isLoading?: boolean;
  canManageSchedule: boolean;
  onRefetch: () => void;
}

export function ClassSessionTimeline({
  classId,
  classCode,
  shiftLabel,
  sessions,
  isLoading,
  canManageSchedule,
  onRefetch,
}: ClassSessionTimelineProps) {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const rescheduleM = useRescheduleSession();
  const assignCoverM = useAssignCover();
  const cancelCoverM = useCancelCover();

  const [rescheduleRow, setRescheduleRow] = useState<ClassSessionRow | null>(null);
  const [coverRow, setCoverRow] = useState<ClassSessionRow | null>(null);
  const [cancelCoverTarget, setCancelCoverTarget] = useState<ClassSessionRow | null>(null);

  const dotClass = (s: ClassSessionRow) => {
    if (s.status === SESSION_STATUS.completed) return 'bg-green-500 ring-green-500/30';
    if (s.status === SESSION_STATUS.cancelled) return 'bg-red-500 ring-red-500/30';
    return 'bg-[var(--text-muted)] ring-[var(--text-muted)]/30';
  };

  const weekdayLabel = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('vi-VN', { weekday: 'long' });
    } catch {
      return '';
    }
  };

  const teacherCell = (s: ClassSessionRow) => {
    const main = s.mainTeacherName ?? '—';
    if (s.coverTeacherName) {
      return (
        <div className="flex flex-wrap items-center gap-2">
          <Avatar name={s.coverTeacherName} size="sm" />
          <div>
            <span className="text-[var(--text-primary)]">{s.coverTeacherName}</span>
            <Badge variant="warning" className="text-[10px]">
              Cover
            </Badge>
            {main ? <span className="mt-0.5 block text-xs text-[var(--text-muted)]">GV chính: {main}</span> : null}
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <Avatar name={main} size="sm" />
        <span className="text-[var(--text-primary)]">{main}</span>
      </div>
    );
  };

  const canMarkAttendance = (s: ClassSessionRow) => {
    if (s.status !== SESSION_STATUS.pending || !isTodayUtc7(s.scheduledDate)) return false;
    const staff = role === ROLES.ADMIN || role === ROLES.ACADEMIC;
    const own =
      role === ROLES.TEACHER &&
      (s.mainTeacherId === user?.id || s.coverTeacherId === user?.id);
    return staff || own;
  };

  const attendanceDayBlocked = (s: ClassSessionRow) =>
    s.status === SESSION_STATUS.pending && !isTodayUtc7(s.scheduledDate);

  const attendancePermissionBlocked = (s: ClassSessionRow) =>
    s.status === SESSION_STATUS.pending &&
    isTodayUtc7(s.scheduledDate) &&
    !canMarkAttendance(s);

  const canReschedule = (s: ClassSessionRow) =>
    canManageSchedule && s.status === SESSION_STATUS.pending;

  const canAssignCover = (s: ClassSessionRow) =>
    canManageSchedule &&
    s.status === SESSION_STATUS.pending &&
    !s.coverTeacherId &&
    (s.coverStatus == null || s.coverStatus === 'cancelled');

  const canCancelCover = (s: ClassSessionRow) =>
    canManageSchedule && Boolean(s.coverTeacherId) && s.coverStatus !== 'cancelled';

  const onRescheduleSubmit = async (v: RescheduleFormValues) => {
    if (!rescheduleRow) return;
    try {
      await rescheduleM.mutateAsync({
        id: rescheduleRow.id,
        classId,
        body: { newDate: v.newDate, reason: v.reason },
      });
      toast.success('Đã dời lịch');
      setRescheduleRow(null);
      onRefetch();
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message ?? 'Không dời được lịch');
      throw e;
    }
  };

  const onCoverSubmit = async (v: CoverFormValues) => {
    if (!coverRow) return;
    await assignCoverM.mutateAsync({
      id: coverRow.id,
      classId,
      coverTeacherName: v.teacherName,
      body: { coverTeacherId: v.teacherId, reason: v.reason },
    });
    setCoverRow(null);
    onRefetch();
  };

  const onCancelCover = (s: ClassSessionRow) => {
    setCancelCoverTarget(s);
  };

  if (isLoading) {
    return <p className="text-sm text-[var(--text-muted)]">Đang tải lịch học…</p>;
  }

  if (sessions.length === 0) {
    return (
      <p className="text-sm text-[var(--text-muted)]">
        Chưa có buổi học. Dùng &quot;Sinh lịch&quot; sau khi tạo lớp hoặc kiểm tra backend.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative border-l border-[var(--border-default)] pl-5">
        <ul className="space-y-4">
          {sessions.map((s) => (
            <li key={s.id} className="group relative rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">
              <span
                className={cn(
                  'absolute -left-[26px] top-5 size-3 rounded-full ring-2 ring-[var(--bg-surface)]',
                  dotClass(s),
                )}
              />
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-mono text-xs text-[var(--text-muted)]">#{s.sequenceNo}</span>
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      {weekdayLabel(s.scheduledDate)} · {formatDate(s.scheduledDate)}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge domain="session" status={s.status} />
                    {s.coverTeacherName && s.coverStatus !== 'cancelled' ? (
                      <Badge variant="warning" className="text-[10px]">
                        Cover: {s.coverTeacherName}
                      </Badge>
                    ) : null}
                  </div>
                  <div className="pt-1 text-sm">{teacherCell(s)}</div>
                </div>
                <div className="flex flex-wrap gap-1 opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100">
                  {s.status === SESSION_STATUS.completed ? (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(RoutePaths.SESSION_DETAIL.replace(':sessionId', s.id))}
                    >
                      Xem điểm danh
                    </Button>
                  ) : canMarkAttendance(s) ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => navigate(RoutePaths.SESSION_DETAIL.replace(':sessionId', s.id))}
                    >
                      Điểm danh
                    </Button>
                  ) : attendanceDayBlocked(s) ? (
                    <Tooltip content={attendanceDayBlockedTooltip(s.scheduledDate)}>
                      <span className="inline-flex">
                        <Button type="button" size="sm" disabled>
                          Điểm danh
                        </Button>
                      </span>
                    </Tooltip>
                  ) : attendancePermissionBlocked(s) ? (
                    <Tooltip content={ATTENDANCE_PERMISSION_TOOLTIP}>
                      <span className="inline-flex">
                        <Button type="button" size="sm" disabled>
                          Điểm danh
                        </Button>
                      </span>
                    </Tooltip>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(RoutePaths.SESSION_DETAIL.replace(':sessionId', s.id))}
                    >
                      Xem
                    </Button>
                  )}
                  {canReschedule(s) ? (
                    <Button type="button" variant="secondary" size="sm" onClick={() => setRescheduleRow(s)}>
                      Reschedule
                    </Button>
                  ) : null}
                  {canAssignCover(s) ? (
                    <Button type="button" variant="secondary" size="sm" onClick={() => setCoverRow(s)}>
                      Gán cover
                    </Button>
                  ) : null}
                  {canCancelCover(s) ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-400"
                      onClick={() => onCancelCover(s)}
                    >
                      Hủy cover
                    </Button>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {rescheduleRow ? (
        <RescheduleModal
          isOpen
          onClose={() => setRescheduleRow(null)}
          sessionId={rescheduleRow.id}
          originalDate={rescheduleRow.scheduledDate}
          onSubmit={onRescheduleSubmit}
          isSubmitting={rescheduleM.isPending}
        />
      ) : null}

      {coverRow ? (
        <CoverModal
          isOpen
          onClose={() => setCoverRow(null)}
          sessionId={coverRow.id}
          classCode={classCode}
          scheduledDate={coverRow.scheduledDate}
          shiftLabel={shiftLabel}
          onSubmit={onCoverSubmit}
          isSubmitting={assignCoverM.isPending}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(cancelCoverTarget)}
        onClose={() => setCancelCoverTarget(null)}
        variant="warning"
        title="Hủy phân công cover"
        message={
          cancelCoverTarget?.coverTeacherName
            ? `Hủy cover của ${cancelCoverTarget.coverTeacherName}?`
            : 'Hủy phân công GV dạy thay?'
        }
        confirmLabel="Hủy cover"
        loading={cancelCoverM.isPending}
        onConfirm={async () => {
          if (!cancelCoverTarget) return;
          try {
            await cancelCoverM.mutateAsync({
              id: cancelCoverTarget.id,
              classId,
              coverTeacherName: cancelCoverTarget.coverTeacherName ?? undefined,
            });
            setCancelCoverTarget(null);
            onRefetch();
          } catch {
            /* toastApiError */
          }
        }}
      />
    </div>
  );
}
