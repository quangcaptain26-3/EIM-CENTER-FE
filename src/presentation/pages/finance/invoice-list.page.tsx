import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoutePaths } from '@/app/router/route-paths';
import { PageShell } from '@/presentation/components/common/page-shell';
import { useInvoices, useOverdueInvoices } from '@/presentation/hooks/finance/use-finance';
import { useFinancePermission } from '@/presentation/hooks/finance/use-finance-permission';
import { useCreateInvoice } from '@/presentation/hooks/finance/use-finance-mutations';
import { useStudents } from '@/presentation/hooks/students';
import { useStudentEnrollments } from '@/presentation/hooks/students';
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
import { FormSelect } from '@/shared/ui/form/form-select';
import { useForm } from 'react-hook-form';
import { useDebounce } from '@/shared/hooks/use-debounce';

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
  const [createModalStudentSearch, setCreateModalStudentSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const debouncedStudentSearch = useDebounce(createModalStudentSearch, 300);
  const { data: studentsData } = useStudents({
    search: debouncedStudentSearch || undefined,
    limit: 10,
  });
  const { data: enrollments = [], isLoading: isEnrollmentsLoading } = useStudentEnrollments(selectedStudentId ?? undefined);

  const { mutate: createInvoice, isPending: isCreatingInvoice } = useCreateInvoice();
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CreateInvoiceFormValues>();

  const handleCloseCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
    setSelectedStudentId(null);
    setCreateModalStudentSearch('');
    reset();
  }, [reset]);

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
        onSuccess: () => handleCloseCreateModal(),
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

      {/* Modal tạo hóa đơn: chọn học viên -> chọn ghi danh — không nhập UUID */}
      <Modal
        open={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        title="Tạo hóa đơn mới"
      >
        <form onSubmit={handleSubmit(handleCreateInvoiceSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Tìm học viên <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Gõ tên hoặc SĐT học viên..."
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm"
                value={createModalStudentSearch}
                onChange={(e) => {
                  setCreateModalStudentSearch(e.target.value);
                  setSelectedStudentId(null);
                  setValue('enrollmentId', '');
                }}
              />
            </div>
            {createModalStudentSearch && (
              <div className="mt-1 max-h-40 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
                {studentsData?.items?.length ? (
                  studentsData.items.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setSelectedStudentId(s.id);
                        setCreateModalStudentSearch(s.fullName);
                        setValue('enrollmentId', '');
                      }}
                      className={cn(
                        "w-full px-4 py-2 text-left text-sm hover:bg-slate-50",
                        selectedStudentId === s.id && "bg-blue-50 text-blue-700"
                      )}
                    >
                      <span className="font-medium">{s.fullName}</span>
                      {s.phone && <span className="text-slate-500 ml-2">{s.phone}</span>}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-slate-500">Không tìm thấy học viên</div>
                )}
              </div>
            )}
          </div>

          <FormSelect
            label="Ghi danh (lớp)"
            required
            {...register('enrollmentId', { required: 'Vui lòng chọn ghi danh' })}
            error={errors.enrollmentId?.message as string}
            options={enrollments
              .filter((e) => e.status === 'ACTIVE' || e.status === 'PAUSED')
              .map((e) => ({
                label: `${e.classCode ?? 'Lớp'} - ${new Date(e.startDate).toLocaleDateString('vi-VN')}`,
                value: e.id,
              }))}
            placeholder={selectedStudentId ? (isEnrollmentsLoading ? 'Đang tải...' : '-- Chọn ghi danh --') : 'Chọn học viên trước'}
            disabled={!selectedStudentId || isEnrollmentsLoading}
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
