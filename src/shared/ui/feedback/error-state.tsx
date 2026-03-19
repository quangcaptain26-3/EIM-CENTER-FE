// error-state.tsx
// Banner báo Error trên các section Panel hoặc Page thay vi Toast

import { cn } from "../../lib/cn";
import { Button } from "../button";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState = ({
  title = "Đã có lỗi xảy ra",
  message = "Không thể tải dữ liệu lúc này, vui lòng thử lại sau.",
  onRetry,
  className,
}: ErrorStateProps) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-red-200 rounded-xl bg-red-50",
        className,
      )}
    >
      <span className="text-4xl mb-3">⚠️</span>
      <h3 className="text-base font-semibold text-red-800 mb-1">{title}</h3>
      <p className="text-sm text-red-600 mb-5">{message}</p>

      {onRetry && (
        <Button variant="danger" size="sm" onClick={onRetry}>
          Thử lại
        </Button>
      )}
    </div>
  );
};
