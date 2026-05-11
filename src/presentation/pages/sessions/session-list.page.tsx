import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { useMySessions } from '@/presentation/hooks/sessions/use-sessions';
import { RoutePaths } from '@/app/router/route-paths';
import { todayYmdUtc7 } from '@/shared/lib/date';
import { SESSION_STATUS } from '@/shared/constants/statuses';

type ShiftFilter = 'all' | 1 | 2;

function statusBadgeLabel(status: string): { text: string; tone: 'default' | 'warning' | 'success' } {
  if (status === SESSION_STATUS.completed) return { text: 'Hoàn thành', tone: 'success' };
  if (status === SESSION_STATUS.pending) return { text: 'Chưa điểm danh', tone: 'default' };
  return { text: 'Đang xử lý', tone: 'warning' };
}

export default function SessionListPage() {
  const navigate = useNavigate();
  const monthKey = todayYmdUtc7().slice(0, 7);
  const { sessions, isLoading, refetch } = useMySessions({ monthKey });
  const [shiftFilter, setShiftFilter] = useState<ShiftFilter>('all');

  const todaySessions = useMemo(() => {
    const today = todayYmdUtc7();
    const rows = sessions.filter((s) => s.scheduledDate.slice(0, 10) === today);
    if (shiftFilter === 'all') return rows;
    return rows.filter((s) => {
      const lb = (s.shiftLabel ?? '').toLowerCase();
      return shiftFilter === 1 ? lb.includes('ca 1') : lb.includes('ca 2');
    });
  }, [sessions, shiftFilter]);

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">Lịch hôm nay</h1>
        <Button type="button" variant="ghost" size="sm" onClick={() => void refetch()}>
          Làm mới
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {([
          ['all', 'Tất cả'],
          [1, 'Ca 1'],
          [2, 'Ca 2'],
        ] as const).map(([id, label]) => (
          <Button
            key={String(id)}
            type="button"
            size="sm"
            variant={shiftFilter === id ? 'primary' : 'secondary'}
            onClick={() => setShiftFilter(id)}
          >
            {label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-sm text-[var(--text-muted)]">Đang tải lịch hôm nay…</p>
      ) : todaySessions.length === 0 ? (
        <p className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 text-sm text-[var(--text-muted)]">
          Không có buổi học nào trong bộ lọc đã chọn.
        </p>
      ) : (
        <ul className="space-y-3">
          {todaySessions.map((s) => {
            const status = statusBadgeLabel(s.status);
            return (
              <li
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-3"
              >
                <div className="space-y-1">
                  <p className="font-medium text-[var(--text-primary)]">{s.classCode ?? s.className ?? 'Lớp'}</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {s.shiftLabel ?? '—'} · {s.roleType === 'cover' ? 'GV cover' : 'GV chính'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={status.tone}>{status.text}</Badge>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => navigate(RoutePaths.SESSION_DETAIL.replace(':sessionId', s.id))}
                  >
                    Mở
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
