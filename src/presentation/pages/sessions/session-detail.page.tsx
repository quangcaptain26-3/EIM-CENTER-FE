import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { useSessionDetail } from '@/presentation/hooks/sessions/use-sessions';
import { useClassRoster } from '@/presentation/hooks/classes/use-classes';
import { useRecordSessionAttendance } from '@/presentation/hooks/sessions/use-session-mutations';
import { AttendanceForm } from '@/presentation/components/classes/attendance-form';
import { StatusBadge } from '@/presentation/components/common/status-badge';
import { RoutePaths } from '@/app/router/route-paths';
import { formatDate } from '@/shared/lib/date';
import { useAuth } from '@/presentation/hooks/auth/use-auth';
import {
  ATTENDANCE_PERMISSION_TOOLTIP,
  attendanceDayBlockedTooltip,
  canUserRecordAttendance,
  getAttendanceBlockReason,
} from '@/presentation/lib/attendance-access';
import type { SessionAttendanceRow } from '@/shared/types/session.type';

export default function SessionDetailPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const { session, isLoading, refetch } = useSessionDetail(sessionId);
  const { roster, isLoading: rosterLoading } = useClassRoster(session?.classId);

  const canRecord = useMemo(
    () => (session ? canUserRecordAttendance(role, user?.id, session) : false),
    [role, user?.id, session],
  );

  const blockReason = useMemo(
    () => getAttendanceBlockReason(role, user?.id, session),
    [role, user?.id, session],
  );

  const banner = useMemo(() => {
    if (blockReason === 'day')
      return attendanceDayBlockedTooltip(session?.scheduledDate);
    if (blockReason === 'permission') return ATTENDANCE_PERMISSION_TOOLTIP;
    if (blockReason === 'status') {
      return 'Buổi học không còn ở trạng thái chờ — không thể sửa điểm danh tại đây.';
    }
    return null;
  }, [blockReason, session?.scheduledDate]);

  const attendanceRows = useMemo((): SessionAttendanceRow[] => {
    if (!session) return [];
    const attByEid = new Map(session.attendanceRows.map((r) => [r.enrollmentId, r]));
    if (roster.length > 0) {
      return roster.map((r) => {
        const att = attByEid.get(r.enrollmentId);
        return {
          enrollmentId: r.enrollmentId,
          studentId: r.studentId,
          studentCode: r.studentCode ?? null,
          studentName: r.studentName,
          status: att?.status ?? null,
          note: att?.note ?? null,
          unexcusedAbsenceCount: r.unexcusedAbsenceCount,
        };
      });
    }
    return session.attendanceRows.map((row) => ({
      ...row,
      unexcusedAbsenceCount: row.unexcusedAbsenceCount,
    }));
  }, [session, roster]);

  const record = useRecordSessionAttendance();

  if (isLoading || !sessionId) {
    return <p className="text-sm text-[var(--text-muted)]">Đang tải…</p>;
  }

  if (!session) {
    return (
      <div className="space-y-2">
        <p className="text-[var(--text-secondary)]">Không tìm thấy buổi học.</p>
        <Button type="button" variant="secondary" onClick={() => navigate(RoutePaths.CLASSES)}>
          Về danh sách lớp
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="-ml-2 text-[var(--text-secondary)]"
        onClick={() =>
          session.classId
            ? navigate(RoutePaths.CLASS_DETAIL.replace(':classId', session.classId))
            : navigate(RoutePaths.CLASSES)
        }
      >
        ← Lớp
      </Button>

      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">Điểm danh buổi học</p>
        <h1 className="mt-1 font-display text-xl font-semibold text-[var(--text-primary)]">
          {session.classCode ? `${session.classCode} · ` : null}Buổi học
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          {formatDate(session.scheduledDate)}
          {session.shiftLabel ? ` · ${session.shiftLabel}` : null}
          {session.roomName ? ` · Phòng ${session.roomName}` : null}
        </p>
        <div className="mt-3 space-y-1 text-sm">
          {session.mainTeacherName ? (
            <p className="text-[var(--text-muted)]">
              <span className="text-[var(--text-muted)]">GV chính: </span>
              <span className="text-[var(--text-primary)]">{session.mainTeacherName}</span>
            </p>
          ) : null}
          {session.coverTeacherName && session.coverStatus !== 'cancelled' ? (
            <p className="text-[var(--text-muted)]">
              <span className="text-[var(--text-muted)]">GV dạy thay (cover): </span>
              <span className="font-medium text-amber-200/95">{session.coverTeacherName}</span>
            </p>
          ) : null}
          {session.coverReason && session.coverStatus !== 'cancelled' ? (
            <p className="text-xs text-[var(--text-muted)]">
              Lý do cover: <span className="text-[var(--text-secondary)]">{session.coverReason}</span>
            </p>
          ) : null}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <StatusBadge domain="session" status={session.status} />
        </div>
      </div>

      {banner ? (
        <p className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/95">
          {banner}
        </p>
      ) : null}

      {rosterLoading ? (
        <p className="text-sm text-[var(--text-muted)]">Đang tải danh sách học viên…</p>
      ) : attendanceRows.length === 0 ? (
        <p className="text-sm text-amber-400/90">
          Chưa có danh sách học viên. Thêm HV vào lớp hoặc kiểm tra API.
        </p>
      ) : (
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">
          <h2 className="mb-4 text-sm font-semibold text-[var(--text-primary)]">Điểm danh</h2>
          <AttendanceForm
            key={`${session.id}-${roster.length}`}
            initialRows={attendanceRows}
            interactive={canRecord}
            isSubmitting={record.isPending}
            onSubmit={async ({ records }) => {
              await record.mutateAsync({
                id: session.id,
                classId: session.classId,
                body: { records },
              });
              void refetch();
            }}
          />
        </div>
      )}
    </div>
  );
}
