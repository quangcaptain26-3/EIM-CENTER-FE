/**
 * Trang danh sách trạng thái thanh toán học sinh.
 * Logic: dựa trên enrollment + invoice + payment, không gộp theo student thuần.
 * Tab: Tất cả | Đã đóng | Chưa đóng | Quá hạn | Chưa có invoice
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '@/presentation/components/common/page-shell';
import { useStudentPaymentStatus } from '@/presentation/hooks/finance/use-finance';
import { useClasses } from '@/presentation/hooks/classes/use-classes';
import { usePrograms } from '@/presentation/hooks/curriculum/use-programs';
import { useFinancePermission } from '@/presentation/hooks/finance/use-finance-permission';
import { formatVND } from '@/shared/lib/currency';
import { Loading } from '@/shared/ui/feedback/loading';
import { EmptyState } from '@/shared/ui/feedback/empty';
import { Button } from '@/shared/ui/button';
import { Search, Eye, ChevronLeft, Download } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { RoutePaths } from '@/app/router/route-paths';

type TabType = 'all' | 'paid' | 'unpaid' | 'overdue' | 'no_invoice';

const TAB_CONFIG: { id: TabType; label: string; paymentStatus?: 'paid' | 'unpaid' | 'partial' | 'overdue' | 'no_invoice' }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'paid', label: 'Đã đóng', paymentStatus: 'paid' },
  { id: 'unpaid', label: 'Chưa đóng', paymentStatus: 'unpaid' },
  { id: 'overdue', label: 'Quá hạn', paymentStatus: 'overdue' },
  { id: 'no_invoice', label: 'Chưa có invoice', paymentStatus: 'no_invoice' },
];

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  paid: 'Đã đóng',
  unpaid: 'Chưa đóng',
  partial: 'Thanh toán một phần',
  overdue: 'Quá hạn',
  no_invoice: 'Chưa có invoice',
};

const PAYMENT_STATUS_VARIANT: Record<string, 'active' | 'inactive' | 'pending' | 'error'> = {
  paid: 'active',
  unpaid: 'inactive',
  partial: 'pending',
  overdue: 'error',
  no_invoice: 'inactive',
};

interface StudentPaymentStatusItem {
  studentId: string;
  studentName: string;
  enrollmentId: string;
  classId: string | null;
  classCode: string | null;
  programId: string | null;
  programName: string | null;
  invoiceId: string | null;
  invoiceAmount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate: string | null;
  paymentStatus: string;
}

export default function StudentPaymentStatusListPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [keyword, setKeyword] = useState('');
  const [classId, setClassId] = useState<string>('');
  const [programId, setProgramId] = useState<string>('');
  const [page, setPage] = useState(0);
  const limit = 20;

  const { canRead } = useFinancePermission();
  const tabConfig = TAB_CONFIG.find((t) => t.id === activeTab);

  const { data: payload, isLoading } = useStudentPaymentStatus({
    paymentStatus: tabConfig?.paymentStatus,
    classId: classId || undefined,
    programId: programId || undefined,
    keyword: keyword.trim() || undefined,
    limit,
    offset: page * limit,
  });

  const { data: classesData } = useClasses({ limit: 200 });
  const { data: programs } = usePrograms();

  const items = (payload?.items ?? []) as StudentPaymentStatusItem[];
  const total = payload?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  const handleRowClick = (item: StudentPaymentStatusItem) => {
    if (item.enrollmentId) {
      navigate(RoutePaths.STUDENT_FINANCE.replace(':enrollmentId', item.enrollmentId));
    }
  };

  const handleExport = async () => {
    const { financeApi } = await import('@/infrastructure/services/finance.api');
    await financeApi.exportStudentPaymentStatusExcel({
      paymentStatus: tabConfig?.paymentStatus,
      classId: classId || undefined,
      programId: programId || undefined,
      keyword: keyword.trim() || undefined,
    });
  };

  return (
    <PageShell
      title="Trạng thái thanh toán học sinh"
      description="Danh sách học sinh đã đóng/chưa đóng học phí theo enrollment và hóa đơn. Không gộp theo học viên đơn lẻ."
      actions={
        canRead && (
          <Button variant="secondary" size="sm" onClick={handleExport} className="flex items-center gap-2">
            <Download className="w-4 h-4" /> Xuất Excel
          </Button>
        )
      }
    >
      {/* Tab + Filter */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex p-1 bg-slate-100 rounded-lg w-fit">
            {TAB_CONFIG.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setPage(0); }}
                className={cn(
                  'px-4 py-1.5 text-sm font-medium rounded-md transition-all',
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-end">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên học viên"
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setPage(0); }}
            />
          </div>
          <select
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={classId}
            onChange={(e) => { setClassId(e.target.value); setPage(0); }}
          >
            <option value="">Tất cả lớp</option>
            {(classesData?.items ?? []).map((c: { id: string; code: string; name: string }) => (
              <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
            ))}
          </select>
          <select
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={programId}
            onChange={(e) => { setProgramId(e.target.value); setPage(0); }}
          >
            <option value="">Tất cả chương trình</option>
            {(programs ?? []).map((p: { id: string; name: string }) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {!canRead && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-amber-800 text-sm">
          Bạn không có quyền xem dữ liệu tài chính.
        </div>
      )}

      {canRead && (
        <>
          {isLoading ? (
            <Loading text="Đang tải danh sách..." className="py-20" />
          ) : !items.length ? (
            <EmptyState
              title="Không có dữ liệu"
              description="Thử thay đổi bộ lọc hoặc tab."
            />
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 font-semibold text-slate-700">Học viên</th>
                        <th className="px-6 py-4 font-semibold text-slate-700">Lớp</th>
                        <th className="px-6 py-4 font-semibold text-slate-700">Chương trình</th>
                        <th className="px-6 py-4 font-semibold text-slate-700">Tổng tiền</th>
                        <th className="px-6 py-4 font-semibold text-slate-700">Đã đóng</th>
                        <th className="px-6 py-4 font-semibold text-slate-700">Còn lại</th>
                        <th className="px-6 py-4 font-semibold text-slate-700">Hạn đóng</th>
                        <th className="px-6 py-4 font-semibold text-slate-700">Trạng thái</th>
                        <th className="px-6 py-4 font-semibold text-slate-700 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((item) => (
                        <tr
                          key={`${item.enrollmentId}-${item.invoiceId ?? 'no-inv'}`}
                          className={cn(
                            'hover:bg-slate-50/80 transition-colors cursor-pointer',
                            item.paymentStatus === 'overdue' && 'bg-red-50/30'
                          )}
                          onClick={() => handleRowClick(item)}
                        >
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-900">{item.studentName}</div>
                          </td>
                          <td className="px-6 py-4 text-slate-700">
                            {item.classCode ?? item.classId ?? '—'}
                          </td>
                          <td className="px-6 py-4 text-slate-700">
                            {item.programName ?? '—'}
                          </td>
                          <td className="px-6 py-4 font-mono text-slate-900">
                            {formatVND(item.invoiceAmount)}
                          </td>
                          <td className="px-6 py-4 font-mono text-green-600">
                            {formatVND(item.paidAmount)}
                          </td>
                          <td className="px-6 py-4 font-mono text-red-600">
                            {formatVND(item.remainingAmount)}
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            {item.dueDate ? new Date(item.dueDate).toLocaleDateString('vi-VN') : '—'}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={cn(
                                'inline-flex px-2 py-0.5 rounded text-xs font-medium',
                                PAYMENT_STATUS_VARIANT[item.paymentStatus] === 'active' && 'bg-green-100 text-green-800',
                                PAYMENT_STATUS_VARIANT[item.paymentStatus] === 'error' && 'bg-red-100 text-red-800',
                                PAYMENT_STATUS_VARIANT[item.paymentStatus] === 'pending' && 'bg-amber-100 text-amber-800',
                                PAYMENT_STATUS_VARIANT[item.paymentStatus] === 'inactive' && 'bg-slate-100 text-slate-700'
                              )}
                            >
                              {PAYMENT_STATUS_LABELS[item.paymentStatus] ?? item.paymentStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRowClick(item);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Phân trang */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-slate-500">
                    Hiển thị {page * limit + 1}–{Math.min((page + 1) * limit, total)} / {total}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={page === 0}
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="px-4 py-2 text-sm text-slate-600">
                      Trang {page + 1} / {totalPages}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    >
                      <ChevronLeft className="w-4 h-4 rotate-180" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </PageShell>
  );
}
