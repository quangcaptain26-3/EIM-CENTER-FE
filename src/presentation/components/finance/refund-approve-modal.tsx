import { useEffect, useState } from 'react';
import { Modal } from '@/shared/ui/modal';
import { Button } from '@/shared/ui/button';
import { FormInput } from '@/shared/ui/form/form-input';
import { useApproveRefundRequest } from '@/presentation/hooks/finance/use-refund-requests';

interface RefundApproveModalProps {
  requestId: string | null;
  listParams: Record<string, unknown>;
  onClose: () => void;
}

export function RefundApproveModal({ requestId, listParams, onClose }: RefundApproveModalProps) {
  const approveM = useApproveRefundRequest();
  const [approveNote, setApproveNote] = useState('');
  const [approvedAmountStr, setApprovedAmountStr] = useState('');

  useEffect(() => {
    if (!requestId) return;
    setApproveNote('');
    setApprovedAmountStr('');
  }, [requestId]);

  const close = () => {
    if (approveM.isPending) return;
    setApproveNote('');
    setApprovedAmountStr('');
    onClose();
  };

  const submit = () => {
    if (!requestId || approveM.isPending) return;
    const raw = approvedAmountStr.replace(/\D/g, '');
    const payload = {
      id: requestId,
      reviewNote: approveNote.trim() || '—',
      approvedAmount: raw ? Number(raw) : undefined,
      listParams,
    };
    onClose();
    approveM.mutate(payload);
  };

  return (
    <Modal
      isOpen={Boolean(requestId)}
      onClose={close}
      title="Duyệt hoàn phí"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={close} disabled={approveM.isPending}>
            Hủy
          </Button>
          <Button type="button" isLoading={approveM.isPending} onClick={submit}>
            Duyệt
          </Button>
        </>
      }
    >
      <p className="mb-2 text-sm text-[var(--text-secondary)]">
        Số tiền hoàn thực tế (tuỳ chọn, để trống = theo hệ thống)
      </p>
      <FormInput
        value={approvedAmountStr}
        onChange={(e) => setApprovedAmountStr(e.target.value)}
        placeholder="VD: 1500000"
        className="mb-3"
      />
      <p className="mb-2 text-sm text-[var(--text-secondary)]">Ghi chú duyệt</p>
      <FormInput value={approveNote} onChange={(e) => setApproveNote(e.target.value)} placeholder="Ghi chú" />
    </Modal>
  );
}
