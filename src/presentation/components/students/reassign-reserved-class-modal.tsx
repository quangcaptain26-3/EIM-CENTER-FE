import { useMemo, useState } from 'react';
import { Modal } from '@/shared/ui/modal';
import { Button } from '@/shared/ui/button';
import { FormSelect } from '@/shared/ui/form/form-select';
import { useClassesList } from '@/presentation/hooks/classes/use-classes';
import type { EnrollmentCardModel } from '@/shared/types/student.type';
import type { ClassListItem } from '@/shared/types/class.type';

function classHasCapacity(c: ClassListItem): boolean {
  const max = c.maxEnrollment ?? c.maxCapacity;
  if (max == null || max <= 0) return true;
  return (c.enrollmentCount ?? 0) < max;
}

interface ReassignReservedClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  enrollment: EnrollmentCardModel;
  onSubmit: (newClassId: string) => void | Promise<void>;
  isSubmitting?: boolean;
}

export function ReassignReservedClassModal({
  isOpen,
  onClose,
  enrollment,
  onSubmit,
  isSubmitting = false,
}: ReassignReservedClassModalProps) {
  const [classId, setClassId] = useState('');
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) setClassId('');
  }

  const { classes, isLoading } = useClassesList({
    page: 1,
    limit: 200,
    programId: enrollment.programId || undefined,
  });

  const eligible = useMemo(() => {
    return classes.filter(
      (c) =>
        c.id !== enrollment.classId &&
        classHasCapacity(c) &&
        (!enrollment.programId || c.programId === enrollment.programId) &&
        ['pending', 'active'].includes(String(c.status ?? '').toLowerCase()),
    );
  }, [classes, enrollment.classId, enrollment.programId]);

  const options = useMemo(
    () => [
      { value: '', label: 'Chọn lớp' },
      ...eligible.map((c) => {
        const max = c.maxEnrollment ?? c.maxCapacity ?? 12;
        const n = c.enrollmentCount ?? 0;
        const left = Math.max(0, max - n);
        const st = String(c.status ?? '');
        return {
          value: c.id,
          label: `${c.classCode} (${st}) — ${left}/${max} chỗ trống`,
        };
      }),
    ],
    [eligible],
  );

  const close = () => {
    setClassId('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title="Đổi lớp đang chờ (giữ chỗ)"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={close} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            type="button"
            disabled={!classId || isSubmitting}
            isLoading={isSubmitting}
            onClick={() => void onSubmit(classId)}
          >
            Xác nhận đổi lớp
          </Button>
        </>
      }
    >
      <p className="mb-3 text-sm text-[var(--text-secondary)]">
        Chuyển giữ chỗ sang lớp khác <strong>cùng chương trình</strong>. Phí giữ chỗ và phiếu thu giữ nguyên trên
        ghi danh hiện tại.
      </p>
      {isLoading ? (
        <p className="text-sm text-[var(--text-muted)]">Đang tải danh sách lớp…</p>
      ) : eligible.length === 0 ? (
        <p className="text-sm text-amber-300">Không có lớp cùng chương trình đang nhận học viên.</p>
      ) : (
        <FormSelect label="Lớp mới" options={options} value={classId} onChange={(e) => setClassId(e.target.value)} />
      )}
    </Modal>
  );
}
