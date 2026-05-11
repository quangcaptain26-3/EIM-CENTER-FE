import type { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

export interface FormFieldProps {
  label?: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  helpText?: string;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  required,
  error,
  children,
  helpText,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label ? (
        <label
          htmlFor={htmlFor}
          className="flex items-center gap-0.5 text-sm text-[var(--text-muted)]"
        >
          <span>{label}</span>
          {required ? <span className="text-red-400" aria-hidden>*</span> : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <p className="flex items-start gap-1.5 text-sm text-red-400" role="alert">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
          <span>{error}</span>
        </p>
      ) : null}
      {helpText && !error ? <p className="text-sm text-[var(--text-muted)]">{helpText}</p> : null}
    </div>
  );
}
