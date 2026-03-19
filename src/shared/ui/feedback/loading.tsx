// loading.tsx
// Component hiển thị thông báo "Đang tải hệ thống" dùng Spinner.

import { cn } from "../../lib/cn";

export interface LoadingProps {
  text?: string;
  className?: string;
}

export const Loading = ({ text = "Đang tải...", className }: LoadingProps) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 gap-3 text-[var(--color-text-muted)]",
        className,
      )}
    >
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[var(--color-primary)]"></div>
      <span className="text-sm font-medium animate-pulse">{text}</span>
    </div>
  );
};
