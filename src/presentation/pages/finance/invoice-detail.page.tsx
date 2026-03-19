import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageShell } from '@/presentation/components/common/page-shell';
import { useInvoice } from '@/presentation/hooks/finance/use-finance';
import { useCreatePayment, useUpdateInvoiceStatus } from '@/presentation/hooks/finance/use-finance-mutations';
import { useFinancePermission } from '@/presentation/hooks/finance/use-finance-permission';
import { formatVND } from '@/shared/lib/currency';
import { Loading } from '@/shared/ui/feedback/loading';
import { ErrorState } from '@/shared/ui/feedback/error-state';
import { InvoiceStatusBadge } from '@/presentation/components/finance/invoice-status-badge';
import { PaymentForm } from '@/presentation/components/finance/payment-form';
import { InvoiceStatus } from '@/domain/finance/models/invoice.model';
import { PaymentMethod } from '@/domain/finance/models/payment.model';
import type { CreatePaymentDto } from '@/application/finance/dto/finance.dto';
import { Modal } from '@/shared/ui/modal';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { ArrowLeft, User, Calendar, CreditCard, Clock, CheckCircle2, History } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const { hasWriteAccess } = useFinancePermission();

  // Sửa [A3-1]: Thêm isError để bắt trường hợp API thất bại, tránh silent fail
  const { data: invoice, isLoading, isError, refetch } = useInvoice(id);
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateInvoiceStatus(id!);
  const { mutate: createPayment, isPending: isCreatingPayment } = useCreatePayment();

  if (isLoading) return <Loading text="Đang tải chi tiết hóa đơn..." className="py-20" />;
  // Sửa [A3-1]: Hiện ErrorState thay vì div thô khi API lỗi hoặc không có dữ liệu
  if (isError || !invoice) return (
    <PageShell title="Chi tiết Hóa đơn">
      <ErrorState
        title="Không tìm thấy hóa đơn"
        message="Hóa đơn bạn cần xem không tồn tại hoặc bạn không có quyền truy cập."
        onRetry={() => refetch()}
      />
    </PageShell>
  );

  const handleUpdateStatus = (newStatus: InvoiceStatus) => {
    updateStatus({ status: newStatus }, {
      onSuccess: () => {
        setIsStatusModalOpen(false);
      }
    });
  };

  const handleCreatePayment = (values: { amount: number; method: PaymentMethod; note?: string }) => {
    if (!id) return;
    const payload: CreatePaymentDto = {
      invoiceId: id,
      amount: values.amount,
      method: values.method,
      paidAt: new Date().toISOString(),
      note: values.note,
    };
    createPayment(payload, {
      onSuccess: () => {
        setIsPaymentModalOpen(false);
      },
    });
  };

  const statusList = [
    { value: InvoiceStatus.UNPAID, label: 'Chưa thanh toán' },
    { value: InvoiceStatus.PAID, label: 'Đã hoàn tất' },
    { value: InvoiceStatus.OVERDUE, label: 'Đã quá hạn' },
  ];

  const percentPaid = Math.min(100, (invoice.paidAmount / invoice.amount) * 100);

  return (
    <PageShell
      title={`Chi tiết Hóa đơn #${invoice.id.split('-')[0]}`}
      actions={
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate(-1)} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </Button>
          
          {/* Các thao tác chỉnh sửa/ghi nhận: Chặn Director/Academic (Read-only) */}
          {hasWriteAccess && (
            <>
              <Button variant="ghost" onClick={() => setIsStatusModalOpen(true)}>
                Cập nhật trạng thái
              </Button>
              {invoice.status !== InvoiceStatus.PAID && (
                <Button onClick={() => setIsPaymentModalOpen(true)}>
                  Ghi nhận thanh toán
                </Button>
              )}
            </>
          )}
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{invoice.studentName}</h3>
                  <p className="text-sm text-slate-500">Khóa học: {invoice.programName}</p>
                </div>
              </div>
              <InvoiceStatusBadge status={invoice.status} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-slate-100 pt-6">
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-medium uppercase">Ngày lập h.đơn</span>
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <Calendar className="w-4 h-4 text-slate-300" />
                  {new Date(invoice.createdAt).toLocaleDateString('vi-VN')}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-medium uppercase">Hạn thanh toán</span>
                <div className="flex items-center gap-2 text-red-500 font-bold">
                  <Clock className="w-4 h-4 text-red-200" />
                  {new Date(invoice.dueDate).toLocaleDateString('vi-VN')}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-medium uppercase">Hình thức</span>
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <CreditCard className="w-4 h-4 text-slate-300" />
                  Thu học phí định kỳ
                </div>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-blue-500" /> Lịch sử thanh toán
              </h3>
              <Badge variant="info">{invoice.payments?.length || 0} Giao dịch</Badge>
            </div>

            {invoice.payments && invoice.payments.length > 0 ? (
              <div className="space-y-4">
                {invoice.payments.map((p) => (
                  <div key={p.id} className="flex items-start justify-between p-4 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">+{formatVND(p.amount)}</div>
                        <div className="text-xs text-slate-500">
                          {p.method === PaymentMethod.TRANSFER ? 'Chuyển khoản' : 'Tiền mặt'} • {new Date(p.paidAt).toLocaleString('vi-VN')}
                        </div>
                        {p.note && <div className="text-xs text-slate-400 italic mt-1 font-mono">"{p.note}"</div>}
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className="text-[10px] text-slate-400 uppercase tracking-tighter">Ghi nhận bởi</span>
                      <span className="text-xs font-medium text-slate-600">{p.recordedBy || 'Hệ thống'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center italic text-slate-400">Chưa có giao dịch thanh toán nào được ghi nhận.</div>
            )}
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 bg-slate-800 text-white">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Số tiền còn nợ</span>
              <div className="text-3xl font-black mt-2">{formatVND(invoice.remainingAmount)}</div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-slate-500">Tổng phí phải đóng:</span>
                <span className="text-slate-900">{formatVND(invoice.amount)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-slate-500">Tổng đã đóng:</span>
                <span className="text-green-600">{formatVND(invoice.paidAmount)}</span>
              </div>

              {/* Progress */}
              <div className="pt-2 space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-400">
                  <span>Tỷ lệ hoàn tất</span>
                  <span>{percentPaid.toFixed(1)}%</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all duration-700",
                      invoice.status === InvoiceStatus.PAID ? "bg-green-500" : "bg-blue-500"
                    )}
                    style={{ width: `${percentPaid}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal open={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Ghi nhận thanh toán">
        <PaymentForm 
          invoiceId={invoice.id}
          remainingAmount={invoice.remainingAmount}
          onSuccess={handleCreatePayment}
          isLoading={isCreatingPayment}
        />
      </Modal>

      <Modal open={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)} title="Cập nhật trạng thái thủ công">
        <div className="space-y-3">
          <p className="text-sm text-slate-500 mb-4 italic">
            * Cảnh báo: Việc cập nhật trạng thái thủ công chỉ nên thực hiện trong các trường hợp ngoại lệ. 
            Hệ thống thường tự động tính toán trạng thái dựa trên các khoản thanh toán.
          </p>
          <div className="flex flex-col gap-2">
            {statusList.map((st) => (
              <button
                key={st.value}
                onClick={() => handleUpdateStatus(st.value)}
                disabled={isUpdatingStatus || invoice.status === st.value}
                className={cn(
                  "px-4 py-3 rounded-lg text-left font-medium transition-all flex justify-between items-center",
                  invoice.status === st.value 
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200" 
                    : "bg-white hover:bg-blue-50 text-slate-700 border border-slate-200 hover:border-blue-200"
                )}
              >
                {st.label}
                {invoice.status === st.value && <Badge variant="default">Hiện tại</Badge>}
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}
