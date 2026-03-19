// input.tsx
// Input Text Field hỗ trợ gán Label phụ và in thông báo màu đỏ khi có Error

import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "../lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    // Mặc định cho input viền xám, nếu lỗi hiện viền đỏ
    const baseInput =
      "flex h-10 w-full rounded-lg border bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] outline-none transition-colors placeholder-[var(--color-text-muted)]";
    const borderClass = error
      ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
      : "border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]";

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-[var(--color-text)]"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <input
          ref={ref}
          id={id}
          className={cn(
            baseInput,
            borderClass,
            "disabled:cursor-not-allowed disabled:bg-gray-100",
            className,
          )}
          {...props}
        />

        {/* Dòng chữ báo lỗi */}
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    );
  },
);

Input.displayName = "Input";
