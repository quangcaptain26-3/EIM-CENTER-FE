import { Eye, Edit } from 'lucide-react';

export interface ClassRowActionsProps {
  classId: string;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
}

/**
 * Menu hành động (View/Edit) từng bản ghi trong ClassTable
 */
export const ClassRowActions = ({ classId, onView, onEdit }: ClassRowActionsProps) => {
  return (
    <div className="flex items-center gap-2">
      {onView && (
        <button
          onClick={() => onView(classId)}
          className="p-1.5 text-gray-500 hover:text-[var(--color-primary)] hover:bg-blue-50 rounded-md transition-colors"
          title="Xem chi tiết"
        >
          <Eye className="w-4 h-4" />
        </button>
      )}
      {onEdit && (
        <button
          onClick={() => onEdit(classId)}
          className="p-1.5 text-gray-500 hover:text-[var(--color-primary)] hover:bg-blue-50 rounded-md transition-colors"
          title="Chỉnh sửa"
        >
          <Edit className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
