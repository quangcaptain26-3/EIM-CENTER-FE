import type { ReceiptRow } from '@/shared/types/finance.type';
import { formatDate, formatDateTimeUtc7 } from '@/shared/lib/date';
import { formatVnd } from '@/shared/utils/format-vnd';
import clsx from 'clsx';

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
      className={clsx(
        'mx-auto max-w-2xl rounded-lg border border-gray-300 bg-white p-8 shadow-sm print:border-0 print:shadow-none',
        className
      )}
    >
      <header className="border-b border-gray-200 pb-4 text-center">
        <h2 className="text-lg font-bold uppercase tracking-wide text-gray-900">Phiếu thu</h2>
        <p className="mt-1 text-sm text-gray-600">Trung tâm Anh ngữ EIM</p>
        <p className="mt-2 font-mono text-sm text-gray-800">{receipt.receiptCode}</p>
      </header>

      <div className="mt-6 space-y-3 text-sm">
        <Row label="Ngày thanh toán" value={dateStr} />
        <Row label="Học viên (ID)" value={receipt.studentId} />
        <Row label="Ghi danh" value={receipt.enrollmentId} />
        <Row label="Người nộp" value={receipt.payerName} />
        {receipt.payerAddress ? <Row label="Địa chỉ" value={receipt.payerAddress} /> : null}
        <Row label="Lý do" value={receipt.reason} />
        <Row label="Hình thức" value={methodLabel(receipt.paymentMethod)} />
        <div className="pt-2">
          <p className="text-gray-500">Số tiền</p>
          <p className="text-xl font-bold text-indigo-900">{formatVnd(receipt.amount)}</p>
          {receipt.amountInWords ? (
            <p className="mt-1 text-sm italic text-gray-700">{receipt.amountInWords}</p>
          ) : null}
        </div>
        {receipt.note ? <Row label="Ghi chú" value={receipt.note} /> : null}
      </div>

      <footer className="mt-10 grid grid-cols-2 gap-8 border-t border-gray-200 pt-6 text-center text-sm">
        <div>
          <p className="mb-12 text-gray-500">Người nộp tiền</p>
          <p className="font-medium">{receipt.payerSignatureName ?? receipt.payerName}</p>
        </div>
        <div>
          <p className="mb-12 text-gray-500">Người lập phiếu</p>
          <p className="font-medium text-gray-400">Ký tên</p>
        </div>
      </footer>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 border-b border-gray-100 py-1">
      <span className="w-36 shrink-0 text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}
