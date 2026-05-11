import { useCallback, useEffect, useId, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

/** Giá trị cũ từ `maxWidth` — map sang `size` */
export type ModalMaxWidthLegacy = ModalSize | '2xl';

const sizeClass: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
};

const legacyToSize = (mw: ModalMaxWidthLegacy): ModalSize => {
  if (mw === '2xl') return 'lg';
  return mw;
};

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  /** Kích thước modal — ưu tiên hơn `maxWidth` */
  size?: ModalSize;
  /** @deprecated dùng `size` */
  maxWidth?: ModalMaxWidthLegacy;
  closeOnBackdrop?: boolean;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size,
  maxWidth = 'md',
  closeOnBackdrop = true,
  className,
}: ModalProps) {
  const titleId = useId();
  const descId = useId();

  const resolvedSize = size ?? legacyToSize(maxWidth);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onKeyDown]);

  if (!isOpen) return null;

  const panel = (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Đóng"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => closeOnBackdrop && onClose()}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className={cn(
          'relative z-101 flex max-h-[min(90vh,900px)] w-full flex-col overflow-hidden',
          'rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xl animate-scale-in',
          'max-sm:fixed max-sm:inset-x-0 max-sm:bottom-0 max-sm:top-auto max-sm:max-h-[88vh] max-sm:rounded-b-none max-sm:rounded-t-2xl max-sm:border-x-0 max-sm:border-b-0',
          sizeClass[resolvedSize],
          className,
        )}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[var(--border-subtle)] px-5 py-4">
          <div className="min-w-0 space-y-1">
            <h2 id={titleId} className="font-display text-lg font-semibold text-[var(--text-primary)]">
              {title}
            </h2>
            {description ? (
              <p id={descId} className="text-sm text-[var(--text-secondary)]">
                {description}
              </p>
            ) : null}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="shrink-0 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            onClick={onClose}
            aria-label="Đóng hộp thoại"
          >
            <X className="size-4" strokeWidth={1.5} />
          </Button>
        </div>

        <div className="max-h-[70vh] min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer ? (
          <div className="flex shrink-0 justify-end gap-3 border-t border-[var(--border-subtle)] px-5 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );

  return createPortal(panel, document.body);
}
