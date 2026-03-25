import type { StudentModel } from '@/domain/students/models/student.model';
import { EmptyState } from '@/shared/ui/feedback/empty';
import { Loading } from '@/shared/ui/feedback/loading';
import { StudentRowActions } from './student-row-actions';

export interface StudentTableProps {
  items: StudentModel[];
  loading?: boolean;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
}

/**
 * Hiển thị danh sách học viên dạng Table
 */
export const StudentTable = ({ items, loading, onView, onEdit }: StudentTableProps) => {
  if (loading) {
    return <Loading text="Đang tải danh sách học viên..." className="py-20" />;
  }

  if (!items || items.length === 0) {
    return (
      <EmptyState
        title="Chưa có học viên nào"
        description="Bạn có thể thêm mới học viên để bắt đầu."
        className="bg-white rounded-lg shadow-sm border border-gray-100"
      />
    );
  }

  return (
    <div className="w-full overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-100">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
          <tr>
            <th className="px-6 py-3">Học viên</th>
            <th className="px-6 py-3">Liên hệ</th>
            <th className="px-6 py-3">Người giám hộ</th>
            <th className="px-6 py-3">Ngày tạo</th>
            <th className="px-6 py-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-gray-700">
          {items.map((student) => (
            <tr key={student.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4">
                <div className="font-semibold text-gray-900">{student.fullName}</div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col gap-1">
                  {student.phone ? <span>📞 {student.phone}</span> : null}
                  {student.email ? <span className="text-gray-500">✉️ {student.email}</span> : null}
                  {!student.phone && !student.email && <span className="text-gray-400 italic">Chưa cập nhật</span>}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col gap-1">
                  {student.guardianName ? <span>{student.guardianName}</span> : null}
                  {student.guardianPhone ? <span className="text-gray-500 text-xs">{student.guardianPhone}</span> : null}
                  {!student.guardianName && <span className="text-gray-400 italic">Chưa cập nhật</span>}
                </div>
              </td>
              <td className="px-6 py-4">
                {new Date(student.createdAt).toLocaleDateString('vi-VN')}
              </td>
              <td className="px-6 py-4">
                <div className="flex justify-end">
                  <StudentRowActions
                    studentId={student.id}
                    onView={onView}
                    onEdit={onEdit}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
