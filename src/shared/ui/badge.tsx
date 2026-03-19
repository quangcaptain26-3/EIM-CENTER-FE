// badge.tsx
// Dùng làm chip nhãn dán, ví dụ: "Trạng thái Bận", "Số lượng: 04"...

import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "../lib/cn";

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    // Bảng màu cho badge
    const variants = {
      default: "bg-gray-100 text-gray-800 border-gray-200",
      success: "bg-emerald-100 text-emerald-800 border-emerald-200",
      warning: "bg-orange-100 text-orange-800 border-orange-200",
      danger: "bg-red-100 text-red-800 border-red-200",
      info: "bg-blue-100 text-blue-800 border-blue-200",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
          variants[variant],
          className,
        )}
        {...props}
      />
    );
  },
);

Badge.displayName = "Badge";
