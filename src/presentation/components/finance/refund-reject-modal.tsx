import { useEffect, useState } from 'react';
import { Modal } from '@/shared/ui/modal';
import { Button } from '@/shared/ui/button';
import { FormInput } from '@/shared/ui/form/form-input';
import { useRejectRefundRequest } from '@/presentation/hooks/finance/use-refund-requests';

interface RefundRejectModalProps {
  requestId: string | null;
  listParams: Record<string, unknown>;
  onClose: () => void;
}

export function RefundRejectModal({ requestId, listParams, onClose }: RefundRejectModalProps) {
  const rejectM = useRejectRefundRequest();
  const [rejectNote, setRejectNote] = useState('');

  useEffect(() => {
    if (!requestId) return;
    setRejectNote('');
  }, [requestId]);

  const close = () => {
    if (rejectM.isPending) return;
    setRejectNote('');
    onClose();
  };

  const submit = () => {
    if (!requestId || !rejectNote.trim() || rejectM.isPending) return;
    const payload = {
      id: requestId,
      reviewNote: rejectNote.trim(),
      listParams,
    };
    onClose();
    rejectM.mutate(payload);
  };

  return (
    <Modal
      isOpen={Boolean(requestId)}
      onClose={close}
      title="Từ chối hoàn phí"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={close} disabled={rejectM.isPending}>
            Hủy
          </Button>
          <Button
            type="button"
            variant="danger"
            isLoading={rejectM.isPending}
            disabled={!rejectNote.trim()}
            onClick={submit}
          >
            Từ chối
          </Button>
        </>
      }
    >
      <p className="mb-2 text-sm text-[var(--text-secondary)]">Lý do từ chối (bắt buộc)</p>
      <FormInput value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} placeholder="Nhập lý do" />
    </Modal>
  );
}
