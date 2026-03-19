/**
 * src/presentation/components/common/confirm-dialog.tsx
 * Dialog xác nhận hành động nguy hiểm — dùng chung toàn app.
 * Thay thế window.confirm với UI nhất quán theo design system.
 */
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/shared/ui/button';

interface ConfirmDialogProps {
  /** Có hiển thị dialog không */
  isOpen: boolean;
  /** Tiêu đề ngắn gọn */
  title: string;
  /** Nội dung mô tả chi tiết hành động */
  message: string;
  /** Label nút xác nhận (mặc định: "Xác nhận") */
  confirmLabel?: string;
  /** Label nút huỷ (mặc định: "Huỷ") */
  cancelLabel?: string;
  /** Hiện icon cảnh báo màu đỏ thay vì vàng (dùng khi hành động không thể hoàn tác) */
  isDangerous?: boolean;
  /** Trạng thái loading của nút Xác nhận */
  isLoading?: boolean;
  /** Callback khi xác nhận */
  onConfirm: () => void;
  /** Callback khi huỷ hoặc đóng */
  onCancel: () => void;
}

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Huỷ',
  isDangerous = false,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  if (!isOpen) return null;

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onCancel}
    >
      {/* Panel — ngăn event bubble lên backdrop */}
      <div
        className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút X góc trên phải */}
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Icon cảnh báo */}
        <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${isDangerous ? 'bg-red-100' : 'bg-amber-100'}`}>
          <AlertTriangle className={`h-6 w-6 ${isDangerous ? 'text-red-600' : 'text-amber-600'}`} />
        </div>

        {/* Nội dung */}
        <h3 className="text-base font-extrabold text-slate-800 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed">{message}</p>

        {/* Hành động */}
        <div className="mt-6 flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            className={`flex-1 ${isDangerous ? 'bg-red-600 hover:bg-red-700 focus:ring-red-300' : 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-300'}`}
            onClick={onConfirm}
            loading={isLoading}
            disabled={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
