// page-skeleton.tsx
// Skeleton placeholder khi đang load trang — tránh nhấp nháy, tạo cảm giác mượt.

import { cn } from "../../lib/cn";

export interface PageSkeletonProps {
  /** Số dòng skeleton (mặc định 6) */
  rows?: number;
  className?: string;
}

/**
 * Skeleton dạng danh sách/bảng — dùng khi load danh sách students, classes, v.v.
 */
export const PageSkeleton = ({ rows = 6, className }: PageSkeletonProps) => {
  return (
    <div className={cn("animate-pulse space-y-3 p-4", className)}>
      {/* Header giả */}
      <div className="h-8 w-48 rounded bg-gray-200" />
      <div className="h-4 w-full max-w-md rounded bg-gray-100" />
      {/* Các dòng giả */}
      <div className="mt-6 space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="h-12 rounded-lg bg-gray-100"
            style={{ animationDelay: `${i * 50}ms` }}
          />
        ))}
      </div>
    </div>
  );
};
