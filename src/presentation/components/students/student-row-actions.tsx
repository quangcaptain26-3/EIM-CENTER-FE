import { Edit, Eye } from 'lucide-react';
import { ProtectedAction } from '@/presentation/components/common/protected-action';

export interface StudentRowActionsProps {
  studentId: string;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
}

/**
 * Nút bấm thao tác (View, Edit) trên mỗi dòng của bảng Học viên
 */
export const StudentRowActions = ({ studentId, onView, onEdit }: StudentRowActionsProps) => {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onView?.(studentId)}
        className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
        title="Xem chi tiết"
      >
        <Eye className="w-4 h-4" />
      </button>

      {/* Chỉ các role quản lý (ROOT, DIRECTOR, ACADEMIC, SALES) mới hiện nút sửa */}
      <ProtectedAction allowedRoles={['ROOT', 'ACADEMIC']}>
        <button
          type="button"
          onClick={() => onEdit?.(studentId)}
          className="p-1 text-gray-500 hover:text-orange-500 transition-colors"
          title="Chỉnh sửa"
        >
          <Edit className="w-4 h-4" />
        </button>
      </ProtectedAction>
    </div>
  );
};
