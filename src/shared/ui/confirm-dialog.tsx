import { AlertTriangle } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';
import { Modal } from '@/shared/ui/modal';

export type ConfirmDialogVariant = 'danger' | 'warning';

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  variant?: ConfirmDialogVariant;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
}

const iconClass: Record<ConfirmDialogVariant, string> = {
  danger: 'text-red-400',
  warning: 'text-amber-400',
};

export function ConfirmDialog({
  open,
  onClose,
  variant = 'danger',
  title,
  message,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  onConfirm,
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant === 'danger' ? 'danger' : 'outline'}
            className={variant === 'warning' ? 'border-amber-500/40 text-amber-400 hover:bg-amber-500/10' : undefined}
            loading={loading}
            onClick={() => void onConfirm()}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-3">
        <div
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--bg-elevated)]',
            variant === 'danger' && 'bg-red-500/10',
            variant === 'warning' && 'bg-amber-500/10',
          )}
        >
          <AlertTriangle className={cn('size-5', iconClass[variant])} strokeWidth={1.5} />
        </div>
        <p className="min-w-0 flex-1 whitespace-pre-line text-sm leading-relaxed text-[var(--text-secondary)]">{message}</p>
      </div>
    </Modal>
  );
}
