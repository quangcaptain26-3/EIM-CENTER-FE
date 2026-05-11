import {
  cloneElement,
  forwardRef,
  isValidElement,
  type ButtonHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm';

type AnyRecord = Record<string, unknown>;

function mergeEventHandlers(
  theirs: unknown,
  ours: unknown,
): ((e: unknown) => void) | undefined {
  if (typeof theirs !== 'function' && typeof ours !== 'function') return undefined;
  return (e: unknown) => {
    if (typeof theirs === 'function') (theirs as (ev: unknown) => void)(e);
    if (typeof ours === 'function') (ours as (ev: unknown) => void)(e);
  };
}

function assignRef<T>(r: React.Ref<T> | undefined, node: T | null) {
  if (r == null) return;
  if (typeof r === 'function') r(node);
  else (r as React.MutableRefObject<T | null>).current = node;
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  /** @deprecated dùng `loading` */
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  asChild?: boolean;
}

const baseClass = cn(
  'inline-flex items-center justify-center font-medium',
  'transition-[transform,box-shadow,background-color,border-color,color] duration-200',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/35',
  'focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]',
  'disabled:opacity-40 disabled:pointer-events-none',
);

const variantClass: Record<ButtonVariant, string> = {
  primary: cn(
    'border border-transparent bg-[var(--accent)] text-white shadow-sm',
    'hover:bg-[var(--accent-hover)]',
    'active:scale-[0.97]',
  ),
  secondary: cn(
    'border border-[var(--border-default)] bg-[var(--bg-subtle)] text-[var(--text-primary)]',
    'hover:bg-[var(--bg-overlay)]',
    'active:bg-[var(--bg-overlay)]',
  ),
  ghost: cn(
    'border border-transparent bg-transparent text-[var(--text-secondary)]',
    'hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]',
    'active:bg-[var(--bg-overlay)]',
  ),
  danger: cn(
    'border border-[var(--danger-border)] bg-[var(--danger-bg)] text-[var(--danger)]',
    'hover:bg-[var(--danger)] hover:text-white hover:border-[var(--danger)]',
    'active:scale-[0.97]',
  ),
  outline: cn(
    'border border-[var(--border-default)] bg-transparent text-[var(--text-primary)]',
    'hover:bg-[var(--bg-subtle)]',
    'active:bg-[var(--bg-overlay)]',
  ),
};

const sizeClass: Record<ButtonSize, string> = {
  sm: 'h-7 gap-1.5 px-2.5 text-sm rounded-md',
  md: 'h-9 gap-2 px-3.5 text-sm rounded-lg',
  lg: 'h-11 gap-2 px-4 text-base rounded-lg',
  icon: 'size-9 shrink-0 rounded-lg p-0',
  'icon-sm': 'size-7 shrink-0 rounded-md p-0',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = 'primary',
    size = 'md',
    loading,
    isLoading,
    leftIcon,
    rightIcon,
    asChild = false,
    disabled,
    children,
    type = 'button',
    ...props
  },
  ref,
) {
  const showLoading = loading ?? isLoading ?? false;
  const isDisabled = Boolean(disabled || showLoading);

  const classes = cn(baseClass, variantClass[variant], sizeClass[size], className);

  const adornmentStart = showLoading ? (
    <Loader2 className="size-4 shrink-0 animate-spin" strokeWidth={1.5} aria-hidden />
  ) : (
    leftIcon
  );

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<AnyRecord>;
    const cp = child.props as AnyRecord;
    const { onClick, className: childClass, ref: childRef, children: childChildren, ...childRest } = cp;

    // eslint-disable-next-line react-hooks/refs -- asChild: gộp ref cha/con qua callback, không đọc .current trong render
    return cloneElement(child, {
      ...childRest,
      ...props,
      ref: (node: HTMLElement | null) => {
        assignRef(ref, node);
        assignRef(childRef as React.Ref<HTMLElement> | undefined, node);
      },
      className: cn(classes, childClass as string | undefined),
      onClick: mergeEventHandlers(onClick, props.onClick),
      'aria-disabled': isDisabled || undefined,
      tabIndex: isDisabled ? -1 : (cp.tabIndex as number | undefined),
      children: (
        <>
          {adornmentStart ? <span className="inline-flex shrink-0">{adornmentStart}</span> : null}
          {childChildren}
          {rightIcon && !showLoading ? (
            <span className="inline-flex shrink-0">{rightIcon}</span>
          ) : null}
        </>
      ),
    } as never);
  }

  return (
    <button ref={ref} type={type} disabled={isDisabled} className={classes} {...props}>
      {adornmentStart ? <span className="inline-flex shrink-0">{adornmentStart}</span> : null}
      {children != null && children !== false ? (
        <span className={cn(size === 'icon' || size === 'icon-sm' ? 'sr-only' : 'truncate')}>
          {children}
        </span>
      ) : null}
      {rightIcon && !showLoading ? <span className="inline-flex shrink-0">{rightIcon}</span> : null}
    </button>
  );
});

Button.displayName = 'Button';
