import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoutePaths } from '@/app/router/route-paths';
import { PageShell } from '@/presentation/components/common/page-shell';
import { useInvoices, useOverdueInvoices } from '@/presentation/hooks/finance/use-finance';
import { useFinancePermission } from '@/presentation/hooks/finance/use-finance-permission';
import { useCreateInvoice } from '@/presentation/hooks/finance/use-finance-mutations';
import { ExportFinanceModal } from '@/presentation/components/finance/export-finance-modal';
import { formatVND } from '@/shared/lib/currency';
import { Loading } from '@/shared/ui/feedback/loading';
import { EmptyState } from '@/shared/ui/feedback/empty';
import { InvoiceStatusBadge } from '@/presentation/components/finance/invoice-status-badge';
import { InvoiceStatus } from '@/domain/finance/models/invoice.model';
import { Button } from '@/shared/ui/button';
import { ExportExcelButton } from '@/presentation/components/common/export-excel-button';
import { Plus, Eye, Search } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Modal } from '@/shared/ui/modal';
import { FormInput } from '@/shared/ui/form/form-input';
import { useForm } from 'react-hook-form';

type TabType = 'ALL' | 'UNPAID' | 'OVERDUE';

type CreateInvoiceFormValues = {
  enrollmentId: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  note?: string;
};

export default function InvoiceListPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  const [search, setSearch] = useState('');
  const { canRead, hasWriteAccess } = useFinancePermission();
  // State điều khiển hiển thị modal xuất Excel
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { mutate: createInvoice, isPending: isCreatingInvoice } = useCreateInvoice();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateInvoiceFormValues>();

  // Hooks lấy dữ liệu
  const { data: allInvoices, isLoading: isAllLoading } = useInvoices(activeTab !== 'OVERDUE' ? {
    status: activeTab === 'UNPAID' ? InvoiceStatus.UNPAID : undefined,
  } : undefined);

  const { data: overdueInvoices, isLoading: isOverdueLoading } = useOverdueInvoices();

  const invoices = activeTab === 'OVERDUE' ? overdueInvoices?.items : allInvoices?.items;
  const isLoading = activeTab === 'OVERDUE' ? isOverdueLoading : isAllLoading;

  // FIX 5 (Renewal-needed):
  // Tab "Cần tái phí" hiện chưa có backend/filter semantics đúng → ẩn khỏi UI để tránh feature nửa vời.
  const tabs = [
    { id: 'ALL', label: 'Tất cả' },
    { id: 'UNPAID', label: 'Chưa thanh toán' },
    { id: 'OVERDUE', label: 'Quá hạn' },
  ];

  // Params mặc định truyền vào modal dựa theo tab đang active
  const defaultExportParams = {
    status: activeTab === 'UNPAID' ? InvoiceStatus.UNPAID : undefined,
    overdue: activeTab === 'OVERDUE' ? true : undefined,
  };

  const handleCreateInvoiceSubmit = (values: CreateInvoiceFormValues) => {
    createInvoice(
      {
        enrollmentId: values.enrollmentId,
        amount: values.amount,
        dueDate: values.dueDate,
        note: values.note,
      },
      {
        onSuccess: () => {
          setIsCreateModalOpen(false);
          reset();
        },
      },
    );
  };

  return (
    <PageShell
      title="Quản lý Hóa đơn"
      description="Theo dõi danh sách hóa đơn học phí và tình trạng thanh toán."
      actions={
        <div className="flex gap-2">
          {/* Nút Xuất Excel: Guard theo permission để đồng bộ với BE (FINANCE_READ) */}
          <ExportExcelButton 
            onExport={() => setIsExportModalOpen(true)} 
            disabled={!canRead}
            title={!canRead ? "Bạn không có quyền xem/xuất dữ liệu tài chính." : "Xuất danh sách hóa đơn ra Excel (lọc theo due date trong modal)."}
          />
          
          {/* Nút Tạo hóa đơn: Chỉ dành cho người có quyền WRITE (Accountant, Root) */}
          {hasWriteAccess && (
            <Button className="flex items-center gap-2" onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4" /> Tạo hóa đơn
            </Button>
          )}
        </div>
      }
    >
      {/* Search & Tabs */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex p-1 bg-slate-100 rounded-lg w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={cn(
                "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                activeTab === tab.id 
                  ? "bg-white text-blue-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Tìm theo học viên (sắp hỗ trợ)"
            className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled
            title="Tính năng tìm kiếm theo tên học viên đang được hoàn thiện."
          />
        </div>
      </div>

      {isLoading ? (
        <Loading text="Đang tải danh sách hóa đơn..." className="py-20" />
      ) : !invoices || invoices.length === 0 ? (
        <EmptyState title="Không tìm thấy hóa đơn nào" description="Hãy thử thay đổi bộ lọc hoặc tìm kiếm." />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-700">Học viên</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">Gói phí / Chương trình</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">Hạn đóng</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">Ngày đóng</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">Tổng tiền</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">Đã đóng / Còn lại</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">Trạng thái</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr 
                    key={inv.id} 
                    className={cn(
                      "hover:bg-slate-50/80 transition-colors group",
                      inv.status === InvoiceStatus.OVERDUE && "bg-red-50/30"
                    )}
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{inv.studentName || 'N/A'}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-tighter">ID: {inv.id.split('-')[0]}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-700">{inv.programName || 'Chương trình học'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={cn(
                        "text-xs font-medium",
                        inv.status === InvoiceStatus.OVERDUE ? "text-red-500" : "text-slate-600"
                      )}>
                        {new Date(inv.dueDate).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-medium text-slate-600">
                        {inv.lastPaidAt ? new Date(inv.lastPaidAt).toLocaleDateString('vi-VN') : '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-slate-900">
                      {formatVND(inv.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-green-600 font-medium">{formatVND(inv.paidAmount)}</span>
                        <span className="text-red-400 text-[10px] italic">Còn {formatVND(inv.remainingAmount)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <InvoiceStatusBadge status={inv.status} size="sm" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => navigate(RoutePaths.INVOICE_DETAIL.replace(':id', inv.id))}
                        className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal xuất Excel — nhận defaultParams từ tab hiện tại */}
      <ExportFinanceModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        defaultParams={defaultExportParams}
      />

      {/* Modal tạo hóa đơn nhanh (từ trang danh sách) */}
      <Modal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Tạo hóa đơn mới"
      >
        <form onSubmit={handleSubmit(handleCreateInvoiceSubmit)} className="space-y-4">
          <FormInput
            label="Enrollment ID"
            placeholder="UUID của enrollment (ghi danh)"
            {...register('enrollmentId', { required: 'Vui lòng nhập enrollmentId' })}
            error={errors.enrollmentId?.message as string}
          />
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
            <Button type="submit" className="w-full" loading={isCreatingInvoice}>
              Xác nhận tạo hóa đơn
            </Button>
          </div>
        </form>
      </Modal>
    </PageShell>
  );
}
