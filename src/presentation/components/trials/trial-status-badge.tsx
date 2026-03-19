/**
 * Badge hiển thị trạng thái của Trial Lead với màu sắc phân biệt rõ ràng
 * Dùng StatusBadge gốc của hệ thống, map từng TrialStatus sang StatusVariant
 */

import { StatusBadge } from '@/presentation/components/common/status-badge';
import type { StatusVariant } from '@/presentation/components/common/status-badge';
import { cn } from '@/shared/lib/cn';
import type { TrialStatus } from '@/domain/trials/models/trial-lead.model';
import { TRIAL_STATUS_LABELS } from '@/domain/trials/models/trial-lead.model';

// ===================================================
// CẤU HÌNH MÀU SẮC THEO TRẠNG THÁI
// ===================================================

/**
 * Ánh xạ TrialStatus → StatusVariant của Badge:
 * - NEW        → default  (xám)
 * - CONTACTED  → info     (xanh dương)
 * - SCHEDULED  → warning  (cam/vàng)
 * - ATTENDED   → info     (xanh lá nhạt — tận dụng info)
 * - NO_SHOW    → error    (đỏ)
 * - CONVERTED  → active   (xanh lá đậm)
 * - CLOSED     → inactive (xám nhạt)
 */
const TRIAL_STATUS_VARIANT: Record<TrialStatus, StatusVariant> = {
  NEW: 'inactive',
  CONTACTED: 'info',
  SCHEDULED: 'pending',
  ATTENDED: 'active',
  NO_SHOW: 'error',
  CONVERTED: 'active',
  CLOSED: 'inactive',
};

// ===================================================
// COMPONENT
// ===================================================

export interface TrialStatusBadgeProps {
  /** Trạng thái của trial lead cần hiển thị */
  status: TrialStatus;
  /** Kích thước badge: sm cho bảng, md cho trang chi tiết */
  size?: 'sm' | 'md';
  /** Class CSS bổ sung nếu cần */
  className?: string;
}

/**
 * Badge hiển thị trạng thái Trial Lead
 * Tự động lấy nhãn tiếng Việt từ TRIAL_STATUS_LABELS
 *
 * @example
 * <TrialStatusBadge status="SCHEDULED" size="sm" />
 * // → Badge cam với nội dung "Đã đặt lịch"
 */
export const TrialStatusBadge = ({
  status,
  size = 'md',
  className,
}: TrialStatusBadgeProps) => {
  // Lấy variant màu tương ứng
  const variant = TRIAL_STATUS_VARIANT[status];
  // Lấy nhãn tiếng Việt từ model constant
  const label = TRIAL_STATUS_LABELS[status] ?? status;

  // Badge nhỏ hơn cho cột bảng
  const sizeClassName = size === 'sm' ? 'px-1.5 py-0 text-[10px]' : '';

  return (
    <StatusBadge
      status={variant}
      label={label}
      className={cn(sizeClassName, className)}
    />
  );
};
