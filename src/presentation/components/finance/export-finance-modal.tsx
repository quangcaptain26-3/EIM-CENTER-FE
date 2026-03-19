/**
 * src/presentation/components/finance/export-finance-modal.tsx
 * Modal chọn tham số và trigger xuất file Excel danh sách hóa đơn.
 */
import { useState } from 'react';
import { X, FileDown, Calendar } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';
import { useExportFinanceExcel } from '@/presentation/hooks/finance/use-finance-mutations';
import type { ListInvoicesParams } from '@/application/finance/dto/finance.dto';

interface ExportFinanceModalProps {
  /** Trạng thái hiển thị modal */
  isOpen: boolean;
  /** Callback đóng modal */
  onClose: () => void;
  /** Filter mặc định từ trang gọi vào (tab đang active) */
  defaultParams?: Partial<ListInvoicesParams>;
}

export const ExportFinanceModal = ({ isOpen, onClose, defaultParams }: ExportFinanceModalProps) => {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  // State cho date range — bắt buộc theo yêu cầu mới
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState(today);
  const [enrollmentId, setEnrollmentId] = useState('');

  const { mutate: exportExcel, isPending } = useExportFinanceExcel();

  if (!isOpen) return null;

  // Validation: fromDate và toDate bắt buộc, fromDate không được sau toDate
  const isDateMissing = !fromDate || !toDate;
  const isDateInvalid = !!fromDate && !!toDate && fromDate > toDate;
  const isSubmitDisabled = isDateMissing || isDateInvalid || isPending;

  const handleExport = () => {
    const params: ListInvoicesParams = {
      ...defaultParams,
      ...(fromDate ? { fromDate } : {}),
      ...(toDate ? { toDate } : {}),
      ...(enrollmentId ? { enrollmentId } : {}),
    };

    exportExcel(params, {
      onSuccess: () => {
        // Đóng modal sau khi download bắt đầu
        onClose();
      },
    });
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => {
        if (!isPending) onClose();
      }}
    >
      {/* Panel modal — ngăn click lan ra backdrop */}
      <div
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-extrabold text-slate-800">Xuất báo cáo Excel</h2>
            <p className="text-sm text-slate-400 mt-0.5">Khoảng thời gian theo hạn đóng (Due date)</p>
          </div>
          <button
            onClick={() => {
              if (!isPending) onClose();
            }}
            disabled={isPending}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Từ ngày */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-slate-400" />
                Từ ngày (Bắt buộc)
              </span>
            </label>
            <input
              type="date"
              value={fromDate}
              max={toDate || today}
              onChange={(e) => setFromDate(e.target.value)}
              className={cn(
                'w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all',
                isDateInvalid || !fromDate
                  ? 'border-red-400 focus:ring-red-300'
                  : 'border-slate-200 focus:ring-indigo-300 focus:border-indigo-400'
              )}
            />
          </div>

          {/* Đến ngày */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-slate-400" />
                Đến ngày (Bắt buộc)
              </span>
            </label>
            <input
              type="date"
              value={toDate}
              min={fromDate || undefined}
              max={today}
              onChange={(e) => setToDate(e.target.value)}
              className={cn(
                'w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all',
                isDateInvalid || !toDate
                  ? 'border-red-400 focus:ring-red-300'
                  : 'border-slate-200 focus:ring-indigo-300 focus:border-indigo-400'
              )}
            />
          </div>

          {/* Enrollment ID (Tùy chọn) */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Filter theo học viên (Mã Enrollment)
            </label>
            <input
              type="text"
              placeholder="Nhập ID khóa học của học viên (Tùy chọn)"
              value={enrollmentId}
              onChange={(e) => setEnrollmentId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all"
            />
          </div>

          {/* Thông báo lỗi date range */}
          {isDateMissing && (
            <p className="text-xs text-red-500 font-medium">
              ⚠ Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc.
            </p>
          )}
          {isDateInvalid && (
            <p className="text-xs text-red-500 font-medium">
              ⚠ Ngày bắt đầu không được sau ngày kết thúc.
            </p>
          )}

          {/* Ghi chú edge case */}
          <p className="text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2">
            Bộ lọc ngày áp dụng theo <strong>hạn đóng (due date)</strong>, không phải ngày thanh toán. Nếu không có dữ liệu trong khoảng thời gian, file Excel vẫn được tạo với thông báo "Không có dữ liệu".
          </p>
        </div>

        {/* Footer actions */}
        <div className="flex gap-3 mt-6">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onClose}
            disabled={isPending}
          >
            Huỷ
          </Button>
          <Button
            className="flex-1 flex items-center justify-center gap-2"
            onClick={handleExport}
            loading={isPending}
            disabled={isSubmitDisabled}
          >
            <FileDown className="h-4 w-4" />
            {isPending ? 'Đang chuẩn bị...' : 'Xuất file'}
          </Button>
        </div>
      </div>
    </div>
  );
};
