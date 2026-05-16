import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { RoutePaths } from '@/app/router/route-paths';
import { useParsedPrograms, useUpdateProgramDefaultFee } from '@/presentation/hooks/classes/use-classes';
import { usePermission } from '@/presentation/hooks/use-permission';
import { PageHeader } from '@/shared/ui/page-header';
import { Button } from '@/shared/ui/button';
import { FormInput } from '@/shared/ui/form/form-input';
import { formatAmountDots, formatVnd, parseAmountDots } from '@/shared/utils/format-vnd';
import { toastApiError } from '@/shared/lib/api-error';

export default function ProgramFormPage() {
  const { programId } = useParams<{ programId: string }>();
  const navigate = useNavigate();
  const { programs, isLoading } = useParsedPrograms();
  const { canEditProgramDefaultFee } = usePermission();
  const updateFee = useUpdateProgramDefaultFee();

  const program = programs.find((p) => p.id === programId);
  const [amountText, setAmountText] = useState('');

  useEffect(() => {
    if (program?.defaultFee != null) {
      setAmountText(formatAmountDots(program.defaultFee));
    }
  }, [program?.defaultFee, program?.id]);

  if (!canEditProgramDefaultFee) {
    return (
      <div className="p-6">
        <p className="text-sm text-[var(--text-muted)]">Chỉ ADMIN mới được chỉnh học phí chương trình.</p>
        <Button type="button" variant="secondary" className="mt-4" asChild>
          <Link to={RoutePaths.CURRICULUM_PROGRAMS}>Quay lại</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return <p className="p-6 text-sm text-[var(--text-muted)]">Đang tải…</p>;
  }

  if (!program) {
    return (
      <div className="p-6">
        <p className="text-sm text-[var(--text-muted)]">Không tìm thấy chương trình.</p>
        <Button type="button" variant="secondary" className="mt-4" asChild>
          <Link to={RoutePaths.CURRICULUM_PROGRAMS}>Quay lại</Link>
        </Button>
      </div>
    );
  }

  const defaultFee = parseAmountDots(amountText);
  const detailPath = RoutePaths.CURRICULUM_PROGRAM_DETAIL.replace(':programId', program.id);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!programId) return;
    if (!Number.isFinite(defaultFee) || defaultFee < 0) {
      toast.error('Nhập học phí hợp lệ (≥ 0)');
      return;
    }
    try {
      await updateFee.mutateAsync({ programId, defaultFee });
      toast.success('Đã cập nhật học phí chương trình');
      navigate(detailPath);
    } catch (err) {
      toastApiError(err);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title={`Chỉnh học phí — ${program.name}`}
        subtitle={program.code ?? ''}
      />

      <p className="max-w-xl rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-800 dark:text-amber-200">
        Thay đổi không ảnh hưởng học viên đã ghi danh. Chỉ ghi danh mới sau khi lưu mới dùng mức học phí này.
      </p>

      <form onSubmit={onSubmit} className="max-w-md space-y-4">
        <FormInput
          label="Học phí gói (VND)"
          value={amountText}
          onChange={(e) => setAmountText(formatAmountDots(parseAmountDots(e.target.value)))}
          placeholder="VD: 2.500.000"
          required
        />
        {defaultFee > 0 ? (
          <p className="text-sm text-[var(--text-muted)]">Xem trước: {formatVnd(defaultFee)}</p>
        ) : null}

        <div className="flex gap-2">
          <Button type="submit" disabled={updateFee.isPending}>
            {updateFee.isPending ? 'Đang lưu…' : 'Lưu học phí'}
          </Button>
          <Button type="button" variant="secondary" asChild>
            <Link to={detailPath}>Hủy</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
