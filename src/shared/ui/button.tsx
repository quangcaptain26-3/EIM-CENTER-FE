// button.tsx
// Nút bấm cơ bản dùng chung toàn hệ thống, tự động gộp class CSS.

import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "../lib/cn";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    // Class mặc định
    const baseClass =
      "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:ring-2 focus:ring-offset-2 disabled:opacity-70 disabled:pointer-events-none cursor-pointer";

    // Variant styles
    const variants = {
      primary:
        "bg-[var(--color-primary)] text-white hover:bg-blue-700 focus:ring-blue-500 border border-transparent",
      secondary:
        "bg-white text-[var(--color-text)] border border-[var(--color-border)] hover:bg-gray-50",
      danger:
        "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 border border-transparent",
      ghost:
        "bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-gray-100",
    };

    // Size styles
    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base",
    };

    return (
      <button
        ref={ref}
        className={cn(baseClass, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
