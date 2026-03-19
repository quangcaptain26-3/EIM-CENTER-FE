import { useMemo, useState } from 'react';
import { Modal } from '@/shared/ui/modal';
import { Button } from '@/shared/ui/button';
import { FormSelect } from '@/shared/ui/form/form-select';
import { FormInput } from '@/shared/ui/form/form-input';
import type { TrialLeadModel } from '@/domain/trials/models/trial-lead.model';
import { useScheduleTrial } from '@/presentation/hooks/trials/use-trial-mutations';
import { useClasses } from '@/presentation/hooks/classes/use-classes';
import { toastAdapter } from '@/infrastructure/adapters/toast.adapter';

export interface ScheduleTrialModalProps {
  open: boolean;
  onClose: () => void;
  trial: TrialLeadModel;
}

const toDatetimeLocalValue = (iso: string) => {
  // Convert ISO -> yyyy-MM-ddTHH:mm (local)
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};

export const ScheduleTrialModal = ({ open, onClose, trial }: ScheduleTrialModalProps) => {
  const { mutate: scheduleTrial, isPending } = useScheduleTrial(trial.id);

  const { data: classesData, isLoading: isLoadingClasses } = useClasses({ limit: 100 });
  const availableClasses = useMemo(() => {
    const items = classesData?.items ?? [];
    return items.filter((c) => c.status === 'ACTIVE');
  }, [classesData]);

  const [classId, setClassId] = useState<string>(trial.schedule?.classId ?? '');
  const [trialDateLocal, setTrialDateLocal] = useState<string>(
    trial.schedule?.trialDate ? toDatetimeLocalValue(trial.schedule.trialDate) : '',
  );

  const handleConfirm = () => {
    if (!classId) {
      toastAdapter.error('Vui lòng chọn lớp học');
      return;
    }
    if (!trialDateLocal) {
      toastAdapter.error('Vui lòng chọn ngày giờ học thử');
      return;
    }

    const iso = new Date(trialDateLocal).toISOString();
    scheduleTrial(
      { classId, trialDate: iso },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={trial.schedule ? 'Cập nhật lịch học thử' : 'Đặt lịch học thử'}
      className="max-w-lg"
      footer={
        <div className="flex justify-end gap-2 w-full">
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Hủy
          </Button>
          <Button onClick={handleConfirm} loading={isPending} disabled={isPending}>
            Xác nhận
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <FormSelect
          label="Chọn lớp học"
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          required
          options={[
            { label: isLoadingClasses ? 'Đang tải danh sách lớp...' : '--- Chọn lớp ---', value: '' },
            ...availableClasses.map((c) => ({
              label: `${c.name} (${c.code})`,
              value: c.id,
            })),
          ]}
        />

        <FormInput
          label="Ngày giờ học thử"
          type="datetime-local"
          value={trialDateLocal}
          onChange={(e) => setTrialDateLocal(e.target.value)}
          required
        />

        <div className="text-xs text-slate-500">
          Lưu ý: thời gian hiển thị theo múi giờ máy của bạn. Backend sẽ lưu dạng ISO.
        </div>
      </div>
    </Modal>
  );
};

