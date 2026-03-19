/**
 * @file invoice-status-badge.tsx
 * @description Badge hiển thị trạng thái hóa đơn với màu sắc và icon phù hợp.
 */

import { InvoiceStatus } from "@/domain/finance/models/invoice.model";
import { INVOICE_STATUS_LABELS, INVOICE_STATUS_COLORS } from "@/shared/constants/invoice-status";
import { StatusBadge } from "@/presentation/components/common/status-badge";
import { cn } from "@/shared/lib/cn";

export interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Hiển thị Badge trạng thái hóa đơn.
 * Nếu là trạng thái OVERDUE sẽ có thêm icon cảnh báo.
 */
export const InvoiceStatusBadge = ({ status, size = 'md', className }: InvoiceStatusBadgeProps) => {
  const label = INVOICE_STATUS_LABELS[status];
  const variant = INVOICE_STATUS_COLORS[status];
  
  const isOverdue = status === InvoiceStatus.OVERDUE;

  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      <StatusBadge
        status={variant}
        label={label}
        className={cn(size === 'sm' ? "text-[10px] px-1.5 py-0.5" : "text-xs")}
      />
      {isOverdue && (
        <span className="text-red-500 animate-pulse" title="Hóa đơn đã quá hạn thanh toán">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>
          </svg>
        </span>
      )}
    </div>
  );
};
