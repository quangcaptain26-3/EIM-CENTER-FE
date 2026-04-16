import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';
import { EnrollmentBadge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { ENROLLMENT_STATUS } from '@/shared/constants/statuses';
import type { EnrollmentCardModel } from '@/shared/types/student.type';
import { programPillClass } from '@/presentation/components/classes/program-theme';
import { TransferClassModal } from '@/presentation/components/students/transfer-class-modal';
import { PauseModal } from '@/presentation/components/students/pause-modal';
import { DropModal } from '@/presentation/components/students/drop-modal';
import {
  useActivateEnrollment,
  useDropEnrollment,
  usePauseEnrollment,
  useResumeEnrollment,
  useStartTrialEnrollment,
  useTransferClass,
} from '@/presentation/hooks/students/use-enrollment-mutations';
import { usePermission } from '@/presentation/hooks/use-permission';
import { Tooltip } from '@/shared/ui/tooltip';
import { cn } from '@/shared/lib/cn';
import { formatVnd } from '@/shared/utils/format-vnd';
import { RoutePaths } from '@/app/router/route-paths';

interface EnrollmentCardProps {
  enrollment: EnrollmentCardModel;
  studentId: string;
  studentFullName: string;
}

function sessionsProgress(e: EnrollmentCardModel) {
  const total = e.sessionsTotal ?? 24;
  const done = e.sessionsCompleted ?? 0;
  const pct = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
  return { total, done, pct };
}

function CircularRing({ pct, size = 76 }: { pct: number; size?: number }) {
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90" aria-hidden>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        className="stroke-[var(--border-strong)]"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        className="stroke-brand-500 transition-[stroke-dashoffset] duration-500"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
      />
    </svg>
  );
}

/** Rule 2: ưu tiên điều kiện 1 (≥3 buổi) trước điều kiện 2 (đã chuyển). */
function transferClassGuard(e: EnrollmentCardModel): { blocked: boolean; tooltip: string | null } {
  const sa = e.sessionsAttended ?? 0;
  if (sa >= 3) {
    return { blocked: true, tooltip: 'Chỉ được chuyển lớp trong 3 buổi đầu tiên' };
  }
  const tc = e.classTransferCount ?? e.transferCount ?? 0;
  if (tc >= 1) {
    return { blocked: true, tooltip: 'Đã sử dụng lượt chuyển lớp (tối đa 1 lần/khóa)' };
  }
  if (e.transferBlocked) {
    return { blocked: true, tooltip: 'Chuyển lớp không khả dụng cho ghi danh này.' };
  }
  return { blocked: false, tooltip: null };
}

export function EnrollmentCard({ enrollment: e, studentId, studentFullName }: EnrollmentCardProps) {
  const { canManageAcademicEnrollment: canMutate } = usePermission();
  const { total, done, pct } = sessionsProgress(e);
  const [transferOpen, setTransferOpen] = useState(false);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  const startTrial = useStartTrialEnrollment();
  const activate = useActivateEnrollment();
  const dropM = useDropEnrollment();
  const pauseM = usePauseEnrollment();
  const resumeM = useResumeEnrollment();
  const transferM = useTransferClass();

  const readonly =
    e.status === ENROLLMENT_STATUS.completed ||
    e.status === ENROLLMENT_STATUS.dropped ||
    e.status === ENROLLMENT_STATUS.transferred;

  const transferG = transferClassGuard(e);
  const transferDisabled = transferG.blocked;

  const present = e.attendancePresent ?? 0;
  const late = e.attendanceLate ?? 0;
  const exc = e.attendanceExcused ?? 0;
  const unex = e.attendanceUnexcused ?? 0;

  const tuition = e.tuitionFee ?? e.tuitionAmount ?? null;
  const paid = e.amountPaid ?? null;
  const trialAttended = e.sessionsAttended ?? 0;
  const trialCap = 2;
  const trialExhausted = e.status === ENROLLMENT_STATUS.trial && trialAttended >= trialCap;

  const classTitle = e.classCode ?? e.className ?? '—';
  const pillName = e.programName ?? '';

  const debt = e.debtAmount ?? null;
  const activateBlocked = debt != null && debt > 0;
  const activateTooltip = 'Chỉ kích hoạt khi đã đóng đủ học phí (công nợ ≤ 0)';

  const openTransfer = () => {
    if (transferG.blocked) return;
    setTransferOpen(true);
  };

  return (
    <div
      className={cn(
        'rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 shadow-sm',
        e.status === ENROLLMENT_STATUS.active && 'border-l-4 border-l-green-500',
        e.status === ENROLLMENT_STATUS.paused && 'border-l-4 border-l-amber-500',
        e.status === ENROLLMENT_STATUS.trial && 'border-l-4 border-l-blue-500',
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {pillName ? (
            <span
              className={cn('inline-flex rounded-full border px-2 py-0.5 text-xs font-medium', programPillClass(pillName))}
            >
              {pillName}
            </span>
          ) : null}
          <span className="font-mono text-sm text-[var(--text-primary)]">{classTitle}</span>
          {e.pendingPauseRequest && e.status === ENROLLMENT_STATUS.active ? (
            <Link
              to={RoutePaths.PAUSE_REQUESTS}
              className="inline-flex items-center rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-200/95 hover:bg-amber-500/20"
            >
              Đang chờ duyệt
            </Link>
          ) : null}
        </div>
        <EnrollmentBadge status={e.status} />
      </div>

      {e.status === ENROLLMENT_STATUS.trial ? (
        <div className="mt-2 space-y-1">
          <p className="text-xs text-[var(--text-secondary)]">
            Học thử: <span className="font-medium text-[var(--text-primary)]">{trialAttended}</span>/{trialCap} buổi
          </p>
          {trialExhausted ? (
            <p className="rounded-md border border-amber-500/35 bg-amber-500/10 px-2 py-1.5 text-xs text-amber-100/95">
              Đã hết buổi thử — cần đóng học phí để tiếp tục
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="relative flex shrink-0 items-center justify-center">
          <CircularRing pct={pct} />
          <div className="absolute text-center text-[10px] text-[var(--text-secondary)]">
            <div className="text-lg font-semibold text-[var(--text-primary)]">{done}</div>
            <div>/ {total}</div>
          </div>
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">Điểm danh tích lũy</p>
          <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
            <div>
              <span className="text-[var(--text-muted)]">Có mặt</span>
              <p className="font-medium text-emerald-400">{present}</p>
            </div>
            <div>
              <span className="text-[var(--text-muted)]">Muộn</span>
              <p className="font-medium text-amber-400">{late}</p>
            </div>
            <div>
              <span className="text-[var(--text-muted)]">Vắng CP</span>
              <p className="font-medium text-blue-400">{exc}</p>
            </div>
            <div>
              <span className="text-[var(--text-muted)]">Vắng KP</span>
              <p className="font-medium text-red-400">{unex}</p>
            </div>
          </div>
          {e.makeupBlocked ? (
            <p className="flex items-start gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1.5 text-xs text-amber-200">
              <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              Học bù bị khóa vì đã vắng không phép từ 3 lần trở lên
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-4 border-t border-[var(--border-subtle)] pt-3 text-sm">
        <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">Tài chính gói</p>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[var(--text-secondary)]">
          <span>Học phí: {tuition != null ? formatVnd(tuition) : '—'}</span>
          <span>Đã đóng: {paid != null ? formatVnd(paid) : '—'}</span>
          <span className={debt != null && debt > 0 ? 'text-red-400' : 'text-emerald-400'}>
            Còn nợ: {debt != null ? (debt > 0 ? formatVnd(debt) : '0 ₫') : '—'}
          </span>
        </div>
      </div>

      {canMutate && !readonly && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--border-subtle)] pt-4">
          {e.status === ENROLLMENT_STATUS.pending && (
            <>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                isLoading={startTrial.isPending}
                onClick={() => startTrial.mutate({ id: e.id, studentId })}
              >
                ▶ Bắt đầu thử
              </Button>
              {activateBlocked ? (
                <Tooltip content={activateTooltip}>
                  <span className="inline-flex cursor-not-allowed">
                    <Button type="button" size="sm" disabled>
                      Kích hoạt
                    </Button>
                  </span>
                </Tooltip>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  isLoading={activate.isPending}
                  onClick={() => activate.mutate({ id: e.id, studentId })}
                >
                  Kích hoạt
                </Button>
              )}
              <Button type="button" size="sm" variant="danger" onClick={() => setDropOpen(true)}>
                ✕ Bỏ học
              </Button>
            </>
          )}

          {e.status === ENROLLMENT_STATUS.trial && (
            <>
              {activateBlocked ? (
                <Tooltip content={activateTooltip}>
                  <span className="inline-flex cursor-not-allowed">
                    <Button type="button" size="sm" disabled>
                      Kích hoạt
                    </Button>
                  </span>
                </Tooltip>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  variant="primary"
                  className={trialExhausted ? 'ring-2 ring-amber-400/45 shadow-lg shadow-amber-500/10' : undefined}
                  isLoading={activate.isPending}
                  onClick={() => activate.mutate({ id: e.id, studentId })}
                >
                  Kích hoạt
                </Button>
              )}
              <Button type="button" size="sm" variant="danger" onClick={() => setDropOpen(true)}>
                ✕ Bỏ học
              </Button>
            </>
          )}

          {e.status === ENROLLMENT_STATUS.active && (
            <>
              {e.pendingPauseRequest ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Tooltip content="Đã có yêu cầu bảo lưu đang chờ duyệt">
                    <span className="inline-flex cursor-not-allowed">
                      <Button type="button" size="sm" variant="secondary" disabled>
                        ⏸ Bảo lưu
                      </Button>
                    </span>
                  </Tooltip>
                  <Link
                    to={RoutePaths.PAUSE_REQUESTS}
                    className="rounded-full border border-amber-500/35 bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-200/95 hover:bg-amber-500/18"
                  >
                    Đang chờ duyệt
                  </Link>
                </div>
              ) : (
                <Button type="button" size="sm" variant="secondary" onClick={() => setPauseOpen(true)}>
                  ⏸ Bảo lưu
                </Button>
              )}
              {transferDisabled ? (
                <Tooltip content={transferG.tooltip ?? 'Không thể chuyển lớp'}>
                  <span className="inline-flex cursor-not-allowed">
                    <Button type="button" size="sm" variant="secondary" disabled>
                      ↔ Chuyển lớp
                    </Button>
                  </span>
                </Tooltip>
              ) : (
                <Button type="button" size="sm" variant="secondary" onClick={openTransfer}>
                  ↔ Chuyển lớp
                </Button>
              )}
              <Button type="button" size="sm" variant="danger" onClick={() => setDropOpen(true)}>
                ✕ Bỏ học
              </Button>
            </>
          )}

          {e.status === ENROLLMENT_STATUS.paused && (
            <Button
              type="button"
              size="sm"
              isLoading={resumeM.isPending}
              onClick={() => resumeM.mutate({ id: e.id, studentId })}
            >
              ▶ Tiếp tục học
            </Button>
          )}
        </div>
      )}

      {readonly && (
        <div className="mt-4 border-t border-[var(--border-subtle)] pt-3 text-sm text-[var(--text-muted)]">
          <EnrollmentBadge status={e.status} />{' '}
          {e.endedAt ? <span className="ml-2">Kết thúc: {e.endedAt.slice(0, 10)}</span> : null}
        </div>
      )}

      <TransferClassModal
        isOpen={transferOpen}
        onClose={() => setTransferOpen(false)}
        enrollment={e}
        isSubmitting={transferM.isPending}
        onSubmit={async (newClassId) => {
          await transferM.mutateAsync({ id: e.id, studentId, body: { newClassId } });
          setTransferOpen(false);
        }}
      />

      <PauseModal
        isOpen={pauseOpen}
        onClose={() => setPauseOpen(false)}
        classLabel={classTitle}
        sessionsAttended={e.sessionsAttended ?? 0}
        isSubmitting={pauseM.isPending}
        onSubmit={async (values) => {
          const result = await pauseM.mutateAsync({ id: e.id, studentId, body: { reason: values.reason } });
          if (result.kind === 'paused') {
            toast.success('Đã bảo lưu thành công');
          } else {
            toast.success('Đã gửi yêu cầu bảo lưu', {
              description: 'Giám đốc sẽ xem xét trong thời gian sớm nhất',
            });
          }
          setPauseOpen(false);
        }}
      />

      <DropModal
        isOpen={dropOpen}
        onClose={() => setDropOpen(false)}
        sessionsAttended={e.sessionsAttended ?? 0}
        studentFullName={studentFullName}
        isSubmitting={dropM.isPending}
        onSubmit={async (body) => {
          await dropM.mutateAsync({ id: e.id, studentId, body });
          setDropOpen(false);
        }}
      />

    </div>
  );
}
