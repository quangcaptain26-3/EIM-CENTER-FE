import type { SessionType } from "@/domain/sessions/models/session.model";
import { SESSION_TYPE_COLORS, SESSION_TYPE_LABELS } from "@/shared/constants/session-type";
import { StatusBadge } from "@/presentation/components/common/status-badge";
import { cn } from "@/shared/lib/cn";

export interface SessionTypeBadgeProps {
  type: SessionType;
  size?: "sm" | "md";
  className?: string;
}

/**
 * Component hiển thị nhãn của loại buổi học bằng StatusBadge chuẩn
 * Các màu sắc tương ứng:
 * - Bình thường: Xám (default)
 * - Kiểm tra nhỏ: Xanh dương (info)
 * - Giữa kỳ: Vàng/Cam (warning/pending)
 * - Cuối kỳ: Đỏ (error)
 */
export const SessionTypeBadge = ({
  type,
  size = "md",
  className,
}: SessionTypeBadgeProps) => {
  // Lấy màu từ file config
  const variant = SESSION_TYPE_COLORS[type];
  // Lấy text hiển thị bằng tiếng Việt chuẩn
  const label = SESSION_TYPE_LABELS[type] || type;

  // Xử lý custom size (md là mặc định của UI/Badge)
  const sizeClassName = size === "sm" ? "px-1.5 py-0 text-[10px]" : "";

  return (
    <StatusBadge
      status={variant}
      label={label}
      className={cn(sizeClassName, className)}
    />
  );
};
