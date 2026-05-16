import { Link } from 'react-router-dom';
import { RoutePaths } from '@/app/router/route-paths';
import { useParsedPrograms } from '@/presentation/hooks/classes/use-classes';
import { usePermission } from '@/presentation/hooks/use-permission';
import { PageHeader } from '@/shared/ui/page-header';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { formatVnd } from '@/shared/utils/format-vnd';
import { programPillClass } from '@/presentation/components/classes/program-theme';
import type { ProgramOption } from '@/shared/types/class.type';

function programPath(id: string, edit = false) {
  return edit
    ? RoutePaths.CURRICULUM_PROGRAM_EDIT.replace(':programId', id)
    : RoutePaths.CURRICULUM_PROGRAM_DETAIL.replace(':programId', id);
}

function ProgramRow({ program, canEdit }: { program: ProgramOption; canEdit: boolean }) {
  const fee = program.defaultFee;
  const pill = programPillClass(program.name);

  return (
    <tr className="border-b border-[var(--border-subtle)] last:border-0">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={`inline-flex rounded-lg px-2 py-1 text-xs font-bold ${pill}`}>
            {program.code?.slice(0, 2) ?? '—'}
          </span>
          <div>
            <p className="font-medium text-[var(--text-primary)]">{program.name}</p>
            <p className="text-xs text-[var(--text-muted)]">{program.code ?? '—'}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 tabular-nums text-[var(--text-primary)]">
        {fee != null ? formatVnd(fee) : '—'}
      </td>
      <td className="px-4 py-3 text-[var(--text-secondary)]">{program.totalSessions ?? 24} buổi</td>
      <td className="px-4 py-3">
        {program.isActive === false ? (
          <Badge variant="default">Ngưng</Badge>
        ) : (
          <Badge variant="success">Đang dùng</Badge>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex justify-end gap-2">
          <Button type="button" size="sm" variant="secondary" asChild>
            <Link to={programPath(program.id)}>Chi tiết</Link>
          </Button>
          {canEdit ? (
            <Button type="button" size="sm" asChild>
              <Link to={programPath(program.id, true)}>Chỉnh học phí</Link>
            </Button>
          ) : null}
        </div>
      </td>
    </tr>
  );
}

export default function ProgramListPage() {
  const { programs, isLoading } = useParsedPrograms();
  const { canEditProgramDefaultFee } = usePermission();

  const sorted = [...programs].sort((a, b) => (a.levelOrder ?? 0) - (b.levelOrder ?? 0));

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Khóa học & Lộ trình"
        subtitle="Học phí mặc định áp dụng cho ghi danh mới. Học viên đã ghi danh giữ mức phí tại thời điểm đăng ký."
      />

      {isLoading ? (
        <p className="text-sm text-[var(--text-muted)]">Đang tải chương trình…</p>
      ) : sorted.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">Không có dữ liệu chương trình.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--border-subtle)] bg-[var(--surface-muted)] text-[var(--text-muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Chương trình</th>
                <th className="px-4 py-3 font-medium">Học phí gói</th>
                <th className="px-4 py-3 font-medium">Số buổi</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
                <th className="px-4 py-3 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((p) => (
                <ProgramRow key={p.id} program={p} canEdit={canEditProgramDefaultFee} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
