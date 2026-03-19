import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageShell } from '@/presentation/components/common/page-shell';
import { useInvoices } from '@/presentation/hooks/finance/use-finance';
import { useCreateInvoice } from '@/presentation/hooks/finance/use-finance-mutations';
import { useFinancePermission } from '@/presentation/hooks/finance/use-finance-permission';
import { formatVND } from '@/shared/lib/currency';
import { Loading } from '@/shared/ui/feedback/loading';
import { EmptyState } from '@/shared/ui/feedback/empty';
import { InvoiceCard } from '@/presentation/components/finance/invoice-card';
import { Modal } from '@/shared/ui/modal';
import { Button } from '@/shared/ui/button';
import { Plus, ArrowLeft, Wallet, Info } from 'lucide-react';
import { FormInput } from '@/shared/ui/form/form-input';
import { useForm } from 'react-hook-form';

export default function StudentFinancePage() {
  const { enrollmentId } = useParams<{ enrollmentId: string }>();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { hasWriteAccess } = useFinancePermission();

  // Lấy danh sách hóa đơn của ghi danh này
  const { data: invoiceData, isLoading, refetch } = useInvoices({ enrollmentId });
  const { mutate: createInvoice, isPending: isCreating } = useCreateInvoice();

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  if (isLoading) return <Loading text="Đang tải dữ liệu tài chính..." className="py-20" />;

  const invoices = invoiceData?.items || [];
  
  // Tính toán tóm tắt từ danh sách hóa đơn
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const totalRemaining = invoices.reduce((sum, inv) => sum + inv.remainingAmount, 0);

  // Thông báo học viên (lấy từ hóa đơn đầu tiên nếu có)
  const firstInvoice = invoices[0];
  const studentName = firstInvoice?.studentName || "Học viên";
  const programName = firstInvoice?.programName || "Chương trình học";

  const onSubmit = (data: any) => {
    createInvoice({
      enrollmentId: enrollmentId!,
      amount: data.amount,
      dueDate: data.dueDate,
      note: data.note,
    }, {
      onSuccess: () => {
        setIsModalOpen(false);
        reset();
        refetch();
      }
    });
  };

  return (
    <PageShell
      title={`Tài chính: ${studentName}`}
      description={`Quản lý công nợ và hóa đơn cho khóa học ${programName}`}
      actions={
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate(-1)} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </Button>
          {hasWriteAccess && (
            <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> Tạo hóa đơn mới
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Aggregated Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tổng phải đóng</p>
              <p className="text-xl font-black text-slate-900">{formatVND(totalAmount)}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tổng đã đóng</p>
              <p className="text-xl font-black text-green-600">{formatVND(totalPaid)}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600">
              <Info className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Còn nợ</p>
              <p className="text-xl font-black text-red-600">{formatVND(totalRemaining)}</p>
            </div>
          </div>
        </div>

        {/* Invoices List */}
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            Danh sách hóa đơn ({invoices.length})
          </h3>
          
          {invoices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {invoices.map((inv) => (
                <InvoiceCard 
                  key={inv.id} 
                  invoice={inv} 
                  onPaymentSuccess={refetch}
                  readonly={!hasWriteAccess}
                />
              ))}
            </div>
          ) : (
            <EmptyState 
              title="Chưa có hóa đơn nào" 
              description="Hãy bắt đầu bằng cách tạo hóa đơn đầu tiên cho học viên này."
            />
          )}
        </div>
      </div>

      {/* Modal tạo hóa đơn */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tạo hóa đơn học phí mới"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormInput
            label="Số tiền (VND)"
            type="number"
            placeholder="Ví dụ: 2500000"
            {...register('amount', { required: 'Vui lòng nhập số tiền', valueAsNumber: true })}
            error={errors.amount?.message as string}
          />
          <FormInput
            label="Ngày đến hạn"
            type="date"
            {...register('dueDate', { required: 'Vui lòng chọn ngày hạn' })}
            error={errors.dueDate?.message as string}
          />
          <FormInput
            label="Ghi chú"
            placeholder="Ví dụ: Phí học kỳ 1"
            {...register('note')}
          />
          
          <div className="pt-2">
            <Button type="submit" className="w-full" loading={isCreating}>
              Xác nhận tạo hóa đơn
            </Button>
          </div>
        </form>
      </Modal>
    </PageShell>
  );
}
