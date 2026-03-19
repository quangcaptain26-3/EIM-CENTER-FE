import type { EnrollmentStatus } from '@/domain/students/models/enrollment.model';
import { ENROLLMENT_STATUS_OPTIONS } from '@/shared/constants/enrollment-status';
import { StatusBadge, type StatusVariant } from '@/presentation/components/common/status-badge';

export interface EnrollmentStatusBadgeProps {
  status: EnrollmentStatus;
  className?: string;
}

/**
 * Hiển thị Badge trạng thái ghi danh
 */
export const EnrollmentStatusBadge = ({ status, className }: EnrollmentStatusBadgeProps) => {
  // Map EnrollmentStatus sang StatusVariant mảng màu hiện có
  let variant: StatusVariant = "info";
  
  switch (status) {
    case 'ACTIVE':
      variant = 'active'; // Xanh lá
      break;
    case 'PAUSED':
    case 'TRANSFERRED':
      variant = 'pending'; // Vàng/Cam
      break;
    case 'DROPPED':
      variant = 'error'; // Đỏ
      break;
    case 'GRADUATED':
      variant = 'info'; // Xanh dương
      break;
  }

  return (
    <StatusBadge
      status={variant}
      label={ENROLLMENT_STATUS_OPTIONS[status] || status}
      className={className}
    />
  );
};
