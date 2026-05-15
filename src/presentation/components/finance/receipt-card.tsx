import type { ReceiptRow } from '@/shared/types/finance.type';
import { formatDate, formatDateTimeUtc7 } from '@/shared/lib/date';
import { formatVndAmount } from '@/shared/utils/format-vnd';
import { cn } from '@/shared/lib/cn';
import { FinanceDocHeader, FinanceDocSignatureBlock, FinanceDocStatRow } from '@/presentation/components/finance/finance-document';

function methodLabel(m: string): string {
  if (m === 'cash') return 'Tiền mặt';
  if (m === 'transfer' || m === 'bank_transfer') return 'Chuyển khoản';
  return m || '—';
}

interface ReceiptCardProps {
  receipt: ReceiptRow;
  className?: string;
}

export function ReceiptCard({ receipt, className = '' }: ReceiptCardProps) {
  const dateStr = receipt.paymentDate
    ? String(receipt.paymentDate).includes('T')
      ? formatDateTimeUtc7(receipt.paymentDate)
      : formatDate(receipt.paymentDate)
    : '—';

  return (
    <div
      className={cn(
        'mx-auto max-w-2xl rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6 shadow-sm print:border-zinc-300 print:bg-white print:shadow-none md:p-8',
        className,
      )}
    >
      <FinanceDocHeader title="Phiếu thu" docCode={receipt.receiptCode} />

      <div className="mt-6 space-y-2">
        <FinanceDocStatRow label="Ngày thanh toán" value={dateStr} />
        <FinanceDocStatRow label="Học viên (ID)" value={receipt.studentId} />
        <FinanceDocStatRow label="Ghi danh" value={receipt.enrollmentId} />
        <FinanceDocStatRow label="Người nộp" value={receipt.payerName} />
        {receipt.payerAddress ? <FinanceDocStatRow label="Địa chỉ" value={receipt.payerAddress} /> : null}
        <FinanceDocStatRow label="Lý do" value={receipt.reason} />
        <FinanceDocStatRow label="Hình thức" value={methodLabel(receipt.paymentMethod)} />
        <div className="pt-2">
          <FinanceDocStatRow label="Số tiền" value={formatVndAmount(receipt.amount)} variant="total" />
          {receipt.amountInWords ? (
            <p className="mt-2 text-sm italic text-[var(--text-secondary)] print:text-zinc-700">{receipt.amountInWords}</p>
          ) : null}
        </div>
        {receipt.note ? <FinanceDocStatRow label="Ghi chú" value={receipt.note} /> : null}
      </div>

      <FinanceDocSignatureBlock
        leftTitle="Người nộp tiền"
        leftHint={receipt.payerSignatureName ?? receipt.payerName}
        rightTitle="Người lập phiếu"
        rightHint="Ký tên"
      />
    </div>
  );
}
