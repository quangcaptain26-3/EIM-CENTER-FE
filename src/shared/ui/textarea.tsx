import { forwardRef, useLayoutEffect, useRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, error, onInput, rows = 1, style, ...props },
  ref,
) {
  const innerRef = useRef<HTMLTextAreaElement | null>(null);

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [props.value, props.defaultValue]);

  const setRefs = (node: HTMLTextAreaElement | null) => {
    innerRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  return (
    <textarea
      ref={setRefs}
      rows={rows}
      onInput={(e) => {
        onInput?.(e);
        const el = e.currentTarget;
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
      }}
      className={cn(
        'min-h-9 w-full resize-none rounded-lg border bg-[var(--bg-subtle)] px-3 py-2 text-sm text-[var(--text-primary)]',
        'placeholder:text-[var(--text-muted)] transition-[border-color,box-shadow]',
        'outline-none focus:outline-none',
        error
          ? 'border-red-500/50 shadow-[0_0_0_3px_rgba(239,68,68,0.15)]'
          : cn(
              'border-[var(--border-default)] hover:border-[var(--border-strong)]',
              'focus:border-brand-500 focus:shadow-[0_0_0_3px_rgba(108,99,255,0.2)]',
            ),
        className,
      )}
      style={style}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';
