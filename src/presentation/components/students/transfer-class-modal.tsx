import { useMemo, useState } from 'react';
import { Modal } from '@/shared/ui/modal';
import { Button } from '@/shared/ui/button';
import { FormSelect } from '@/shared/ui/form/form-select';
import { useClassesList } from '@/presentation/hooks/classes/use-classes';
import type { EnrollmentCardModel } from '@/shared/types/student.type';
import type { ClassListItem } from '@/shared/types/class.type';

function classHasCapacity(c: ClassListItem): boolean {
  const max = c.maxEnrollment;
  if (max == null || max <= 0) return true;
  const n = c.enrollmentCount ?? 0;
  return n < max;
}

interface TransferClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  enrollment: EnrollmentCardModel;
  onSubmit: (newClassId: string) => void | Promise<void>;
  isSubmitting?: boolean;
}

export function TransferClassModal({
  isOpen,
  onClose,
  enrollment,
  onSubmit,
  isSubmitting = false,
}: TransferClassModalProps) {
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
    status: 'active',
  });

  const eligible = useMemo(() => {
    return classes.filter(
      (c) =>
        c.id !== enrollment.classId &&
        classHasCapacity(c) &&
        (!enrollment.programId || c.programId === enrollment.programId)
    );
  }, [classes, enrollment.classId, enrollment.programId]);

  const sessionsAttended = enrollment.sessionsAttended ?? 0;
  const transferCount = enrollment.classTransferCount ?? enrollment.transferCount ?? 0;
  const showWarning = sessionsAttended >= 3 || transferCount >= 1;
  const onlyTransferLeft = transferCount === 0;

  const options = useMemo(
    () => [
      { value: '', label: 'Chọn lớp' },
      ...eligible.map((c) => {
        const max = c.maxEnrollment ?? 12;
        const n = c.enrollmentCount ?? 0;
        const left = Math.max(0, max - n);
        return {
          value: c.id,
          label: `${c.classCode}${c.roomName ? ` · ${c.roomName}` : ''} — ${left}/${max} chỗ trống`,
        };
      }),
    ],
    [eligible]
  );

  const close = () => {
    setClassId('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title="Chuyển lớp"
      maxWidth="lg"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={close} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            type="button"
            isLoading={isSubmitting}
            disabled={!classId}
            onClick={() => void onSubmit(classId)}
          >
            Xác nhận chuyển
          </Button>
        </>
      }
    >
      {onlyTransferLeft && !showWarning ? (
        <div className="mb-4 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
          <p className="font-medium">Đây là lần chuyển lớp duy nhất</p>
          <p className="mt-0.5 text-amber-200/90">Sau khi chuyển, bạn sẽ không còn lượt chuyển lớp khác.</p>
        </div>
      ) : null}
      {showWarning && (
        <div className="mb-4 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
          <p className="font-medium">Lưu ý</p>
          <ul className="mt-1 list-inside list-disc text-amber-200/90">
            {sessionsAttended >= 3 ? <li>Đã tham gia từ 3 buổi trở lên.</li> : null}
            {transferCount >= 1 ? <li>Đã từng chuyển lớp (số lần: {transferCount}).</li> : null}
          </ul>
        </div>
      )}
      <p className="mb-2 text-sm text-gray-600">
        Chỉ hiển thị lớp cùng chương trình, đang mở và còn chỗ (nếu hệ thống có giới hạn sĩ số).
      </p>
      {isLoading ? (
        <p className="text-sm text-gray-500">Đang tải danh sách lớp…</p>
      ) : (
        <FormSelect
          label="Lớp mới"
          name="newClassId"
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          options={options}
        />
      )}
    </Modal>
  );
}
