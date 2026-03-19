// status-badge.tsx
// Badge quy chuẩn cho các trạng thái hay gặp: Hoạt động, Đã nghỉ, Đang học, Chờ duyệt

import { Badge } from "@/shared/ui/badge";

export type StatusVariant =
  | "active"
  | "inactive"
  | "pending"
  | "error"
  | "info";

export interface StatusBadgeProps {
  status: StatusVariant;
  label: string;
  className?: string;
}

export const StatusBadge = ({ status, label, className }: StatusBadgeProps) => {
  // Map nội bộ sang Badge Variant gốc
  const mappedVariant = {
    active: "success",
    inactive: "default",
    pending: "warning",
    error: "danger",
    info: "info",
  } as const;

  return (
    <Badge variant={mappedVariant[status]} className={className}>
      {/* Thêm chấm tròn nhỏ tạo điểm nhấn dynamic */}
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-75"></span>
      {label}
    </Badge>
  );
};
