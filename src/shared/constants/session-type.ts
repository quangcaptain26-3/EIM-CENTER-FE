import { SessionType } from "@/domain/sessions/models/session.model";
import type { StatusVariant } from "@/presentation/components/common/status-badge";

/**
 * Định nghĩa Labels (tiếng Việt) cho từng loại Session
 */
export const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  [SessionType.NORMAL]: "Bình thường",
  [SessionType.QUIZ]: "Kiểm tra nhỏ",
  [SessionType.MIDTERM]: "Giữa kỳ",
  [SessionType.FINAL]: "Cuối kỳ",
};

/**
 * Định nghĩa Variant màu sắc (cho StatusBadge) ứng với từng loại Session
 * - Normal = mặc định (thường là gray/info)
 * - Quiz = info (xanh dương/blue)
 * - Midterm = warning (cam/amber)
 * - Final = error (đỏ/red)
 */
export const SESSION_TYPE_COLORS: Record<SessionType, StatusVariant> = {
  [SessionType.NORMAL]: "inactive", // Mặc định hiển thị nhạt (xám) để tập trung vào content học
  [SessionType.QUIZ]: "info", // Xanh lam
  [SessionType.MIDTERM]: "pending", // Cam/vàng
  [SessionType.FINAL]: "error", // Đỏ nổi bật
};
