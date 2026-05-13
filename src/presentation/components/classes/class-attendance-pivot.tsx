import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/shared/ui/button';
import type { ClassAttendanceMatrixPayload } from '@/infrastructure/services/classes.api';
import { exportData } from '@/infrastructure/services/system.api';
import { cn } from '@/shared/lib/cn';
import { formatDateTime } from '@/shared/lib/date';
import { getSessionAttendanceHistory } from '@/infrastructure/services/sessions.api';
import { Modal } from '@/shared/ui/modal';

/** Hiển thị ô điểm danh — đổi ký hiệu: sửa map này và exporter BE attendance-sheet.exporter.ts cho đồng bộ. */
function cellLetter(status: string): string {
  if (status === 'present') return 'P';
  if (status === 'late') return 'L';
  if (status === 'absent_excused') return 'A';
  if (status === 'absent_unexcused') return 'U';
  return '';
}

function cellClass(status: string): string {
  if (status === 'present' || status === 'late') return 'bg-emerald-500/15 text-emerald-300';
  if (status === 'absent_excused') return 'bg-red-500/15 text-red-300';
  if (status === 'absent_unexcused') return 'bg-amber-500/15 text-amber-300';
  return 'text-[var(--text-muted)]';
}

interface ClassAttendancePivotProps {
  classId: string;
  classCode: string;
  matrix: ClassAttendanceMatrixPayload | null;
  isLoading: boolean;
}

export function ClassAttendancePivot({ classId, classCode, matrix, isLoading }: ClassAttendancePivotProps) {
  const [historySessionId, setHistorySessionId] = useState<string | null>(null);
  const cellMap = useMemo(() => {
    const m = new Map<string, string>();
    matrix?.cells.forEach((c) => {
      m.set(`${c.studentId}:${c.sessionId}`, c.status);
    });
    return m;
  }, [matrix]);
  const { data: editHistory } = useQuery({
    queryKey: ['sessions', historySessionId, 'attendance-history'],
    queryFn: () => getSessionAttendanceHistory(historySessionId!),
    enabled: Boolean(historySessionId),
    staleTime: 0,
  });

  const handleExport = async () => {
    try {
      const { blob, filename } = await exportData('attendance', { classId });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename ?? `DiemDanh_${classCode}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Đã tải file điểm danh');
    } catch {
      toast.error('Không xuất được file');
    }
  };

  if (isLoading) {
    return <p className="text-sm text-[var(--text-muted)]">Đang tải ma trận điểm danh…</p>;
  }

  if (!matrix || matrix.sessions.length === 0) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[var(--text-secondary)]">Chưa có buổi học trên lớp — chưa thể lập ma trận điểm danh.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-[var(--text-secondary)]">
          Học viên × buổi 1…{matrix.sessions.length} — P có mặt, L muộn, A vắng có phép, U vắng không phép.
        </p>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => void handleExport()}
          leftIcon={<Download className="size-4" strokeWidth={1.5} aria-hidden />}
        >
          Xuất Excel
        </Button>
      </div>
      <div className="max-w-full overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
        <table className="min-w-max border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-base)]">
              <th className="sticky left-0 z-10 min-w-[160px] border-r border-[var(--border-subtle)] bg-[var(--bg-base)] px-2 py-2 font-medium text-[var(--text-primary)]">
                Học viên
              </th>
              {matrix.sessions.map((s) => (
                <th
                  key={s.id}
                  className="min-w-[52px] px-1 py-2 text-center font-medium text-[var(--text-secondary)]"
                  title={s.sessionDate}
                >
                  {s.sessionNo}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.students.map((st) => (
              <tr key={st.studentId} className="border-b border-[var(--border-subtle)]/80">
                <td className="sticky left-0 z-10 border-r border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2 py-1.5 text-[var(--text-primary)]">
                  <span className="block max-w-[200px] truncate font-medium">{st.studentName}</span>
                  {st.studentCode ? (
                    <span className="block font-mono text-[10px] text-[var(--text-muted)]">{st.studentCode}</span>
                  ) : null}
                </td>
                {matrix.sessions.map((s) => {
                  const status = cellMap.get(`${st.studentId}:${s.id}`) ?? '';
                  const letter = cellLetter(status);
                  return (
                    <td key={s.id} className="px-0 py-1 text-center tabular-nums">
                      <span
                        className={cn(
                          'inline-flex min-h-[1.5rem] min-w-[1.75rem] items-center justify-center rounded',
                          cellClass(status),
                        )}
                        title={status || 'Chưa điểm danh'}
                      >
                        {letter || '—'}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr>
              <td className="sticky left-0 z-10 border-r border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2 py-1.5 text-[10px] text-[var(--text-muted)]">
                Trạng thái buổi
              </td>
              {matrix.sessions.map((s) => (
                <td key={`foot-${s.id}`} className="px-1 py-1.5 text-center text-[10px]">
                  {!s.submittedAt ? (
                    <span className="text-slate-400">Chưa điểm danh</span>
                  ) : (
                    <span className="text-emerald-300">
                      ✓ {formatDateTime(s.submittedAt)}{s.submittedByName ? ` · ${s.submittedByName}` : ''}
                      {s.lastEditedAt ? (
                        <button
                          type="button"
                          className="ml-1 inline-flex rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[10px] text-amber-300"
                          onClick={() => setHistorySessionId(s.id)}
                        >
                          đã chỉnh sửa
                        </button>
                      ) : null}
                    </span>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <Modal
        isOpen={Boolean(historySessionId)}
        onClose={() => setHistorySessionId(null)}
        title="Lịch sử chỉnh sửa điểm danh"
        maxWidth="lg"
      >
        <div className="space-y-2">
          {(editHistory ?? [])
            .filter((h) => h.action === 'ATTENDANCE:edited')
            .map((h) => (
              <div key={h.id} className="rounded border border-[var(--border-subtle)] p-2 text-sm">
                <p className="text-[var(--text-primary)]">
                  {h.actorRole} · {h.actorCode} · {h.createdAt ? formatDateTime(h.createdAt) : ''}
                </p>
                <p className="text-[var(--text-secondary)]">
                  Lý do: {String((h.metadata?.editReason as string | undefined) ?? '—')}
                </p>
              </div>
            ))}
        </div>
      </Modal>
    </div>
  );
}
