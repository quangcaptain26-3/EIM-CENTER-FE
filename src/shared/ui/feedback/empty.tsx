// empty.tsx
// Trạng thái trống (VD List danh sách không có Data, Học viên null...).

import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

export interface EmptyProps {
  title?: string;
  description?: string;
  className?: string;
  action?: ReactNode; // Nút bấm bổ sung nếu cần
}

export const EmptyState = ({
  title = "Không có dữ liệu",
  description = "Chưa có thông tin nào được hiển thị.",
  className,
  action,
}: EmptyProps) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center text-[var(--color-text-muted)]",
        className,
      )}
    >
      <span className="text-5xl mb-4 opacity-30">📂</span>
      <h3 className="text-base font-semibold text-[var(--color-text)] mb-1">
        {title}
      </h3>
      <p className="text-sm mb-4">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
