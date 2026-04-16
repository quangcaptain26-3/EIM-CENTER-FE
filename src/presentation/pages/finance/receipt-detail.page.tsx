import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { ReceiptCard } from '@/presentation/components/finance/receipt-card';
import { useReceipt, useVoidReceipt } from '@/presentation/hooks/finance/use-receipts';
import { RoutePaths } from '@/app/router/route-paths';
import { usePermission } from '@/presentation/hooks/use-permission';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { formatVnd } from '@/shared/utils/format-vnd';

export default function ReceiptDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canCreateReceipt } = usePermission();
  const { receipt, isLoading, refetch } = useReceipt(id);
  const voidM = useVoidReceipt();
  const [voidOpen, setVoidOpen] = useState(false);

  const print = () => window.print();

  const canVoid = receipt && receipt.amount > 0 && !receipt.voidedByReceiptId && canCreateReceipt;

  const voidMessage = receipt
    ? `Tạo phiếu âm bù trừ ${formatVnd(-receipt.amount)}?`
    : '';

  const onVoidConfirm = async () => {
    if (!receipt) return;
    try {
      await voidM.mutateAsync({ id: receipt.id });
      setVoidOpen(false);
      void refetch();
    } catch {
      /* toast trong mutation */
    }
  };

  if (isLoading || !receipt) {
    return (
      <div className="p-6">
        <p className="text-[var(--text-secondary)]">{isLoading ? 'Đang tải…' : 'Không tìm thấy phiếu thu.'}</p>
        <Button type="button" variant="secondary" className="mt-4" onClick={() => navigate(RoutePaths.RECEIPTS)}>
          Về danh sách
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 flex flex-wrap gap-2 print:hidden">
        <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
          ← Quay lại
        </Button>
        <Button type="button" onClick={print}>
          In phiếu
        </Button>
        {canVoid ? (
          <Button type="button" variant="danger" onClick={() => setVoidOpen(true)}>
            Hủy phiếu
          </Button>
        ) : null}
      </div>
      <ReceiptCard receipt={receipt} />

      <ConfirmDialog
        open={voidOpen}
        onClose={() => setVoidOpen(false)}
        variant="danger"
        title="Hủy phiếu thu"
        message={voidMessage}
        confirmLabel="Xác nhận bù trừ"
        cancelLabel="Đóng"
        loading={voidM.isPending}
        onConfirm={onVoidConfirm}
      />
    </div>
  );
}
