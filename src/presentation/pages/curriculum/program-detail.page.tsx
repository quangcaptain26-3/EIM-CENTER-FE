import { Link, useParams } from 'react-router-dom';
import { RoutePaths } from '@/app/router/route-paths';
import { useParsedPrograms } from '@/presentation/hooks/classes/use-classes';
import { usePermission } from '@/presentation/hooks/use-permission';
import { PageHeader } from '@/shared/ui/page-header';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { formatVnd } from '@/shared/utils/format-vnd';
import { programPillClass } from '@/presentation/components/classes/program-theme';

export default function ProgramDetailPage() {
  const { programId } = useParams<{ programId: string }>();
  const { programs, isLoading } = useParsedPrograms();
  const { canEditProgramDefaultFee } = usePermission();

  const program = programs.find((p) => p.id === programId);

  if (isLoading) {
    return <p className="p-6 text-sm text-[var(--text-muted)]">Đang tải…</p>;
  }

  if (!program) {
    return (
      <div className="p-6">
        <p className="text-sm text-[var(--text-muted)]">Không tìm thấy chương trình.</p>
        <Button type="button" variant="secondary" className="mt-4" asChild>
          <Link to={RoutePaths.CURRICULUM_PROGRAMS}>Quay lại danh sách</Link>
        </Button>
      </div>
    );
  }

  const editPath = RoutePaths.CURRICULUM_PROGRAM_EDIT.replace(':programId', program.id);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader title={program.name} subtitle={program.code ?? ''} />
        {canEditProgramDefaultFee ? (
          <Button type="button" asChild>
            <Link to={editPath}>Chỉnh học phí</Link>
          </Button>
        ) : null}
      </div>

      <div className="max-w-xl space-y-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6">
        <div className="flex items-center gap-2">
          <span className={`rounded-lg px-2 py-1 text-xs font-bold ${programPillClass(program.name)}`}>
            {program.code}
          </span>
          {program.isActive === false ? (
            <Badge variant="default">Ngưng</Badge>
          ) : (
            <Badge variant="success">Đang dùng</Badge>
          )}
        </div>

        <dl className="grid gap-3 text-sm">
          <div>
            <dt className="text-[var(--text-muted)]">Học phí gói mặc định</dt>
            <dd className="text-lg font-semibold tabular-nums text-[var(--text-primary)]">
              {program.defaultFee != null ? formatVnd(program.defaultFee) : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--text-muted)]">Số buổi chuẩn</dt>
            <dd className="text-[var(--text-primary)]">{program.totalSessions ?? 24}</dd>
          </div>
          <div>
            <dt className="text-[var(--text-muted)]">Thứ tự cấp</dt>
            <dd className="text-[var(--text-primary)]">{program.levelOrder ?? '—'}</dd>
          </div>
        </dl>

        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
          Học phí trên chỉ áp dụng cho ghi danh mới. Học viên đã ghi danh giữ mức phí đã chốt tại thời điểm
          đăng ký.
        </p>
      </div>

      <Button type="button" variant="secondary" asChild>
        <Link to={RoutePaths.CURRICULUM_PROGRAMS}>Quay lại danh sách</Link>
      </Button>
    </div>
  );
}
