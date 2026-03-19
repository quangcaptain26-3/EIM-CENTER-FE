/**
 * @file invoice-card.tsx
 * @description Card tổng hợp thông tin hóa đơn và lịch sử thanh toán.
 */

import { useState } from "react";
import type { InvoiceModel } from "@/domain/finance/models/invoice.model";
import { InvoiceStatus } from "@/domain/finance/models/invoice.model";
import { InvoiceStatusBadge } from "./invoice-status-badge";
import { formatVND } from "@/shared/lib/currency";
import { Button } from "@/shared/ui/button";
import { Modal } from "@/shared/ui/modal";
import { PaymentForm } from "./payment-form";
import { useCreatePayment } from "@/presentation/hooks/finance/use-finance-mutations";
import { cn } from "@/shared/lib/cn";
import { PaymentMethod } from "@/domain/finance/models/payment.model";

export interface InvoiceCardProps {
  invoice: InvoiceModel;
  onPaymentSuccess?: () => void;
  readonly?: boolean;
}

/**
 * Component hiển thị thông tin hóa đơn dưới dạng Card.
 */
export const InvoiceCard = ({ invoice, onPaymentSuccess, readonly }: InvoiceCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { mutate: createPayment, isPending } = useCreatePayment();

  const handlePaymentSubmit = (values: any) => {
    createPayment({
      invoiceId: invoice.id,
      amount: values.amount,
      method: values.method,
      paidAt: new Date().toISOString(),
      note: values.note,
    }, {
      onSuccess: () => {
        setIsModalOpen(false);
        onPaymentSuccess?.();
      }
    });
  };

  // Tính toán phần trăm thanh toán cho progress bar
  const percentPaid = Math.min(100, (invoice.paidAmount / invoice.amount) * 100);
  
  // Xác định màu sắc progress bar theo trạng thái
  const progressColor = {
    [InvoiceStatus.PAID]: "bg-green-500",
    [InvoiceStatus.PARTIAL]: "bg-amber-500",
    [InvoiceStatus.UNPAID]: "bg-slate-300",
    [InvoiceStatus.OVERDUE]: "bg-red-500",
  }[invoice.status];

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mã hóa đơn</span>
          <span className="font-mono text-sm text-slate-700">#{invoice.id.split('-')[0]}</span>
        </div>
        <div className="flex flex-col items-end">
          <InvoiceStatusBadge status={invoice.status} />
          <span className="text-[10px] text-slate-500 mt-1">Hạn: {new Date(invoice.dueDate).toLocaleDateString('vi-VN')}</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 mb-1">Tổng cộng</span>
            <span className="font-bold text-slate-800">{formatVND(invoice.amount)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 mb-1">Đã đóng</span>
            <span className="font-bold text-green-600">{formatVND(invoice.paidAmount)}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-slate-500 mb-1">Còn lại</span>
            <span className="font-bold text-red-600">{formatVND(invoice.remainingAmount)}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-medium text-slate-500 uppercase">
            <span>Tiến độ thanh toán</span>
            <span>{percentPaid.toFixed(0)}%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={cn("h-full transition-all duration-500", progressColor)} 
              style={{ width: `${percentPaid}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
        >
          {isExpanded ? 'Ẩn lịch sử' : 'Xem lịch sử thanh toán'}
          <svg className={cn("w-3.5 h-3.5 transition-transform", isExpanded && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="19 9l-7 7-7-7" />
          </svg>
        </button>

        {!readonly && invoice.status !== InvoiceStatus.PAID && (
          <Button size="sm" onClick={() => setIsModalOpen(true)}>
            Ghi nhận thanh toán
          </Button>
        )}
      </div>

      {/* Expanded History */}
      {isExpanded && (
        <div className="px-5 py-4 bg-white border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Lịch sử giao dịch</h4>
          {invoice.payments && invoice.payments.length > 0 ? (
            <div className="space-y-3">
              {invoice.payments.map((payment) => (
                <div key={payment.id} className="flex justify-between items-start text-sm border-l-2 border-slate-100 pl-3 py-1">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-700 text-xs">
                      {payment.method === PaymentMethod.TRANSFER ? 'Chuyển khoản' : payment.method === PaymentMethod.CASH ? 'Tiền mặt' : 'Khác'}
                    </span>
                    <span className="text-[10px] text-slate-500">{new Date(payment.paidAt).toLocaleString('vi-VN')}</span>
                    {payment.note && <span className="text-[10px] italic text-slate-400 mt-0.5">"{payment.note}"</span>}
                  </div>
                  <span className="font-bold text-slate-700">+{formatVND(payment.amount)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-xs text-slate-400 italic">Chưa có giao dịch nào</div>
          )}
        </div>
      )}

      {/* Modal Thanh toán */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Ghi nhận thanh toán"
      >
        <PaymentForm 
          invoiceId={invoice.id}
          remainingAmount={invoice.remainingAmount}
          onSuccess={handlePaymentSubmit}
          isLoading={isPending}
        />
      </Modal>
    </div>
  );
};
