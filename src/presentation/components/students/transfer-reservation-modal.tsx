import { useMemo, useState } from 'react';
import { Modal } from '@/shared/ui/modal';
import { Button } from '@/shared/ui/button';
import { FormSelect } from '@/shared/ui/form/form-select';
import { FormInput } from '@/shared/ui/form/form-input';
import { useClassesList } from '@/presentation/hooks/classes/use-classes';
import type { EnrollmentCardModel } from '@/shared/types/student.type';
import type { ClassListItem } from '@/shared/types/class.type';

function classHasCapacity(c: ClassListItem): boolean {
  const max = c.maxEnrollment ?? c.maxCapacity;
  if (max == null || max <= 0) return true;
  return (c.enrollmentCount ?? 0) < max;
}

interface TransferReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  enrollment: EnrollmentCardModel;
  onSubmit: (body: { newClassId: string; reasonDetail: string }) => void | Promise<void>;
  isSubmitting?: boolean;
}

export function TransferReservationModal({
  isOpen,
  onClose,
  enrollment,
  onSubmit,
  isSubmitting = false,
}: TransferReservationModalProps) {
  const [classId, setClassId] = useState('');
  const [reasonDetail, setReasonDetail] = useState('');
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setClassId('');
      setReasonDetail('');
    }
  }

  const { classes, isLoading } = useClassesList({ page: 1, limit: 200 });

  const eligible = useMemo(() => {
    return classes.filter(
      (c) =>
        c.id !== enrollment.classId &&
        classHasCapacity(c) &&
        ['pending', 'active'].includes(String(c.status ?? '').toLowerCase()),
    );
  }, [classes, enrollment.classId]);

  const options = useMemo(
    () => [
      { value: '', label: 'Chọn lớp đích' },
      ...eligible.map((c) => ({
        value: c.id,
        label: `${c.classCode}${c.programName ? ` · ${c.programName}` : ''} (${c.status})`,
      })),
    ],
    [eligible],
  );

  const close = () => {
    setClassId('');
    setReasonDetail('');
    onClose();
  };

  const canSubmit = Boolean(classId && reasonDetail.trim().length > 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title="Chuyển giữ chỗ sang lớp/chương trình khác"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={close} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            type="button"
            disabled={!canSubmit || isSubmitting}
            isLoading={isSubmitting}
            onClick={() =>
              void onSubmit({ newClassId: classId, reasonDetail: reasonDetail.trim() })
            }
          >
            Xác nhận chuyển
          </Button>
        </>
      }
    >
      <p className="mb-3 text-sm text-[var(--text-secondary)]">
        Tạo ghi danh <strong>reserved</strong> mới. Tiền đã thu chuyển sang ghi danh mới; phần dư sau 20% học phí
        mới được trừ vào 80% còn lại khi kích hoạt.
      </p>
      {isLoading ? (
        <p className="text-sm text-[var(--text-muted)]">Đang tải lớp…</p>
      ) : (
        <>
          <FormSelect label="Lớp mới" options={options} value={classId} onChange={(e) => setClassId(e.target.value)} />
          <div className="mt-3">
            <FormInput
              label="Lý do / ghi chú"
              value={reasonDetail}
              onChange={(e) => setReasonDetail(e.target.value)}
              placeholder="Ví dụ: Chuyển sang chương trình Movers, lớp đang học"
            />
          </div>
        </>
      )}
    </Modal>
  );
}
