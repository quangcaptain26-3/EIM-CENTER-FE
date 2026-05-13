import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { useSessionDetail } from '@/presentation/hooks/sessions/use-sessions';
import { useClassRoster } from '@/presentation/hooks/classes/use-classes';
import { useEditSessionAttendance, useRecordSessionAttendance } from '@/presentation/hooks/sessions/use-session-mutations';
import { AttendanceForm } from '@/presentation/components/classes/attendance-form';
import { StatusBadge } from '@/presentation/components/common/status-badge';
import { RoutePaths } from '@/app/router/route-paths';
import { formatDate } from '@/shared/lib/date';
import { Modal } from '@/shared/ui/modal';
import { useAuth } from '@/presentation/hooks/auth/use-auth';
import { ROLES } from '@/shared/constants/roles';
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
    if (blockReason === 'permission') {
      if (role === ROLES.ACCOUNTANT) return 'Bạn chỉ có quyền xem điểm danh.';
      return ATTENDANCE_PERMISSION_TOOLTIP;
    }
    if (blockReason === 'status') {
      if (role === ROLES.ADMIN && session?.status === 'completed') {
        return 'Buổi đã hoàn tất điểm danh — Giám đốc chỉ xem audit; học vụ chỉnh sửa khi cần.';
      }
      if (role === ROLES.TEACHER && session?.status === 'completed') {
        return 'Buổi đã hoàn tất điểm danh — liên hệ học vụ nếu cần chỉnh.';
      }
      return 'Buổi học không còn ở trạng thái cho phép điểm danh tại đây.';
    }
    return null;
  }, [blockReason, session?.scheduledDate, role, session?.status]);

  const attendanceRows = useMemo((): SessionAttendanceRow[] => {
    if (!session) return [];
    const attByEid = new Map(session.attendanceRows.map((r) => [r.enrollmentId, r]));
    if (roster.length > 0) {
      return roster.map((r) => {
        const att = attByEid.get(r.enrollmentId);
        return {
          enrollmentId: r.enrollmentId,
          enrollmentStatus: r.status,
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
      enrollmentStatus: row.enrollmentStatus,
      unexcusedAbsenceCount: row.unexcusedAbsenceCount,
    }));
  }, [session, roster]);

  const record = useRecordSessionAttendance();
  const edit = useEditSessionAttendance();
  const [editReason, setEditReason] = useState('');
  const [attendanceLockedModal, setAttendanceLockedModal] = useState(false);
  const isSubmitted = Boolean(session?.submittedAt);
  const canEditSubmitted = Boolean(isSubmitted && (role === ROLES.ACADEMIC || role === ROLES.ADMIN));
  const showInteractive = isSubmitted ? canEditSubmitted : canRecord;

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
            interactive={showInteractive}
            readOnlyReason={
              isSubmitted && role === ROLES.TEACHER
                ? 'Buổi đã được điểm danh, giáo viên chỉ có thể xem.'
                : blockReason === 'day'
                ? role === ROLES.TEACHER
                  ? 'Giáo viên chỉ điểm danh trong ngày học.'
                  : 'Ngoài ngày học — học vụ có thể chỉnh điểm danh; giám đốc chỉ khi buổi còn chờ.'
                : undefined
            }
            submitLabel={isSubmitted ? 'Lưu chỉnh sửa' : 'Hoàn tất điểm danh'}
            editReasonRequired={isSubmitted}
            editReasonValue={editReason}
            onEditReasonChange={setEditReason}
            confirmMessage={
              isSubmitted
                ? `Bạn đang sửa điểm danh buổi ${session.sessionNo ?? ''} lớp ${session.classCode ?? ''}. Hành động này sẽ được ghi lại. Xác nhận?`
                : `Điểm danh buổi ${session.sessionNo ?? ''} lớp ${session.classCode ?? ''}: xác nhận lưu?`
            }
            isSubmitting={record.isPending || edit.isPending}
            onSubmit={async ({ records }) => {
              try {
                const alreadySubmitted = Boolean(session.submittedAt);
                if (alreadySubmitted) {
                  const reason = editReason.trim();
                  if (!reason) return;
                  await edit.mutateAsync({
                    id: session.id,
                    classId: session.classId,
                    body: { records, editReason: reason },
                  });
                  setEditReason('');
                } else {
                  await record.mutateAsync({
                    id: session.id,
                    classId: session.classId,
                    body: { records },
                  });
                }
                void refetch();
              } catch (err: any) {
                const code = err?.code ?? err?.response?.data?.code;
                if (code === 'ATTENDANCE_ALREADY_SUBMITTED') {
                  setAttendanceLockedModal(true);
                  void refetch();
                  return;
                }
              }
            }}
          />
        </div>
      )}
      <Modal
        isOpen={attendanceLockedModal}
        onClose={() => setAttendanceLockedModal(false)}
        title="Buổi học đã được điểm danh"
        size="sm"
        footer={
          <Button type="button" onClick={() => setAttendanceLockedModal(false)}>
            Đã hiểu
          </Button>
        }
      >
        <p className="text-sm text-[var(--text-secondary)]">
          Giáo viên chỉ được điểm danh 1 lần. Liên hệ học vụ nếu cần chỉnh sửa.
        </p>
      </Modal>
    </div>
  );
}
