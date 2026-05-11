import { Link } from 'react-router-dom';
import { RoutePaths } from '@/app/router/route-paths';
import { useUpcomingClasses } from '@/presentation/hooks/classes/use-classes';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { scheduleDays as fmtSchedule } from '@/shared/lib/date';
import { fmt } from '@/shared/lib/fmt';

function shiftLabel(shift?: string) {
  if (shift === 'SHIFT_2' || shift === '2') return '19:30-21:00';
  return '18:00-19:30';
}

function parseFloor(roomCode?: string) {
  if (!roomCode) return 'Tầng ?';
  const m = roomCode.match(/(\d)/);
  if (!m) return 'Tầng ?';
  return `Tầng ${m[1]}`;
}

export default function UpcomingClassesPage() {
  const { classes, isLoading } = useUpcomingClasses();

  return (
    <div className="min-h-screen bg-[var(--bg-base)] px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-semibold text-[var(--text-primary)]">
              Lớp sắp khai giảng
            </h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Danh sách lớp đã công bố để phụ huynh tham khảo.
            </p>
          </div>
          <Link to={RoutePaths.LOGIN}>
            <Button type="button" variant="secondary">Đăng nhập nội bộ</Button>
          </Link>
        </div>

        {isLoading ? <p className="text-sm text-[var(--text-muted)]">Đang tải lớp…</p> : null}

        <div className="grid gap-4 md:grid-cols-2">
          {classes.map((c) => {
            const enrolled = c.enrollmentCount ?? 0;
            const max = c.maxCapacity ?? 12;
            const progress = Math.max(0, Math.min(100, Math.round((enrolled / Math.max(max, 1)) * 100)));
            const roomCode = c.roomCode ?? 'P.?';
            return (
              <article
                key={c.id}
                className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5"
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-display text-lg font-semibold text-[var(--text-primary)]">
                    {c.programName ?? c.classCode}
                  </h2>
                  <Badge variant="warning">Sắp khai giảng</Badge>
                </div>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  Lớp {c.classCode} · GV phụ trách: {c.mainTeacherName ?? 'Đang cập nhật'}
                </p>
                <p className="mt-3 text-sm text-[var(--text-secondary)]">
                  Lịch: {fmtSchedule(c.scheduleDays ?? [])} · {shiftLabel(c.shift)}
                </p>
                <p className="text-sm text-[var(--text-secondary)]">
                  Phòng: {parseFloor(roomCode)}, {roomCode}
                </p>
                <p className="text-sm text-[var(--text-secondary)]">
                  Học phí: {fmt.currencyShort(2_800_000)} / khóa
                </p>
                <div className="mt-3 space-y-1">
                  <p className="text-xs text-[var(--text-muted)]">
                    Tiến độ: {enrolled}/{max} học sinh đã đăng ký
                  </p>
                  <div className="h-2 rounded-full bg-[var(--bg-subtle)]">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${progress}%` }} />
                  </div>
                </div>
                <div className="mt-4">
                  <a href="tel:0900000000">
                    <Button type="button">Đăng ký tư vấn</Button>
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
