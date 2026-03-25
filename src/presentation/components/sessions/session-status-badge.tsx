import type { SessionStatus } from "@/domain/sessions/models/session.model";
import { cn } from "@/shared/lib/cn";

const SESSION_STATUS_CONFIG: Record<SessionStatus, { label: string; className: string }> = {
  SCHEDULED: { label: "Đã lên lịch", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  CANCELLED: { label: "Đã hủy", className: "bg-red-100 text-red-800 border-red-200" },
  COMPLETED: { label: "Đã hoàn thành", className: "bg-slate-100 text-slate-700 border-slate-200" },
  MAKEUP: { label: "Học bù", className: "bg-amber-100 text-amber-800 border-amber-200" },
};

export interface SessionStatusBadgeProps {
  status: SessionStatus;
  size?: "sm" | "md";
  className?: string;
}

export const SessionStatusBadge = ({ status, size = "md", className }: SessionStatusBadgeProps) => {
  const config = SESSION_STATUS_CONFIG[status] ?? {
    label: status,
    className: "bg-gray-100 text-gray-700 border-gray-200",
  };
  const sizeClass = size === "sm" ? "px-1.5 py-0 text-[10px]" : "px-2 py-0.5 text-xs";

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border",
        config.className,
        sizeClass,
        className
      )}
    >
      {config.label}
    </span>
  );
};
