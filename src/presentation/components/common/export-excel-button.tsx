import { FileDown } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { useAuth } from '@/presentation/hooks/auth/use-auth';
import type { ButtonProps } from '@/shared/ui/button';

export interface ExportExcelButtonProps extends Omit<ButtonProps, 'onClick'> {
  /** Hành động khi click vào nút xuất file */
  onExport: () => void | Promise<unknown>;
  /** Trạng thái ưu tiên đang xuất report hay không */
  isLoading?: boolean;
  /** Label của button, mặc định là "Xuất Excel" */
  label?: string;
  /** Tham số của report để render dạng tooltip (tuỳ chọn) */
  params?: Record<string, unknown>;
  /** Danh sách các role được phép nhìn thấy component này */
  allowedRoles?: string[];
}

/**
 * Component nút dùng chung để thực hiện lệnh Xuất file Excel
 * Đã tích hợp sẵn: Icon UI thống nhất, loading spinner, check RBAC role.
 */
export const ExportExcelButton = ({
  onExport,
  isLoading = false,
  label = 'Xuất Excel',
  params,
  allowedRoles,
  disabled,
  variant = 'secondary',
  className,
  ...rest
}: ExportExcelButtonProps) => {
  const { hasAnyRole } = useAuth();

  // Guard RBAC: nếu có provided roles mà user không khớp, ẩn button đi
  if (allowedRoles && allowedRoles.length > 0) {
    if (!hasAnyRole(allowedRoles)) {
      return null;
    }
  }

  // Chuyển object params thành chuỗi tooltip đẹp nếu có
  const tooltipText = params && Object.keys(params).length > 0
    ? `Bộ lọc chuẩn bị xuất:\n${Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => `- ${k}: ${v}`)
        .join('\n')}`
    : undefined;

  return (
    <Button
      variant={variant}
      disabled={disabled}
      loading={isLoading}
      onClick={onExport}
      title={tooltipText}
      className={`flex items-center gap-2 ${className || ''}`}
      {...rest}
    >
      {!isLoading && <FileDown className="w-4 h-4" />}
      <span>{isLoading ? 'Đang xuất...' : label}</span>
    </Button>
  );
};
