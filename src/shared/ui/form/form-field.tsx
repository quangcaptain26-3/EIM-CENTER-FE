// form-field.tsx
// Component giàn giáo form: hiển thị label, bọc nội dung input, và thông báo lỗi.

import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

export interface FormFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}

export const FormField = ({
  label,
  error,
  required,
  htmlFor,
  children,
  className,
}: FormFieldProps) => {
  return (
    <div className={cn("flex flex-col gap-1.5 w-full", className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="text-sm font-medium text-[var(--color-text)] relative w-fit"
        >
          {label}
          {required && (
            <span className="text-red-500 absolute -right-3 top-0">*</span>
          )}
        </label>
      )}

      {/* Vùng render Input/Select/... */}
      {children}

      {/* Dòng chữ báo lỗi */}
      {error && (
        <span className="text-xs text-red-500 leading-tight">{error}</span>
      )}
    </div>
  );
};
