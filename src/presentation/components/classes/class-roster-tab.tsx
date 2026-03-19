import { useState } from 'react';
import { useClassRoster } from '../../hooks/classes/use-classes';
import { useAddStudentToClass } from '../../hooks/classes/use-class-mutations';
import { EmptyState } from '../../../shared/ui/feedback/empty';
import { Loading } from '../../../shared/ui/feedback/loading';
import { StatusBadge } from '../../components/common/status-badge';
import { ProtectedAction } from '../../components/common/protected-action';
import { AppRoles } from '../../../shared/constants/roles';
import { PlusCircle } from 'lucide-react';

export interface ClassRosterTabProps {
  classId: string;
  capacity: number;
  currentSize: number;
}

export const ClassRosterTab = ({ classId, capacity, currentSize }: ClassRosterTabProps) => {
  const { data: roster, isLoading, isError } = useClassRoster(classId);
  const { mutate: addStudent, isPending: isAdding } = useAddStudentToClass(classId);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  // BE nhận { enrollmentId } để gán enrollment đã tồn tại vào lớp
  const [enrollmentId, setEnrollmentId] = useState('');

  if (isLoading) {
    return <Loading text="Đang tải danh sách học viên..." className="py-20" />;
  }

  if (isError) {
    return (
      <div className="py-20 text-center flex flex-col items-center">
        <p className="text-red-500 font-medium mb-2">Đã có lỗi khi tải danh sách học viên.</p>
        <span className="text-gray-400 text-sm">Vui lòng thử tải lại trang hoặc liên hệ hỗ trợ.</span>
      </div>
    );
  }

  const items = roster || [];
  const isEmpty = items.length === 0;
  const isFull = currentSize >= capacity;

  const handleOpenAddModal = () => {
    setIsModalOpen(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollmentId.trim()) return;

    // BE nhận { enrollmentId } để gán enrollment đã tồn tại vào lớp
    // Nếu cần tạo mới enrollment thì dùng { studentId, startDate }
    addStudent({ enrollmentId: enrollmentId.trim() }, {
      onSuccess: () => {
        setIsModalOpen(false);
        setEnrollmentId('');
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Danh sách học viên</h2>
          <p className="text-sm text-gray-500 mt-1">Danh sách các học viên đã xếp thành công vào lớp.</p>
          
          {isFull && (
            <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-1.5 rounded-md inline-flex items-center gap-1.5">
              <span className="font-semibold">Lớp đã đầy</span> — Đã đạt giới hạn {capacity} học viên. Không thể thêm mới.
            </div>
          )}
        </div>
        
        <ProtectedAction allowedRoles={[AppRoles.ROOT, AppRoles.ACADEMIC]}>
          <button
            onClick={handleOpenAddModal}
            disabled={isFull}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Thêm học viên</span>
          </button>
        </ProtectedAction>
      </div>

      {isEmpty ? (
        <EmptyState 
          title="Lớp trống" 
          description="Lớp học này hiện tại chưa có học viên nào tham gia."
          className="bg-gray-50 border border-gray-100 rounded-xl"
        />
      ) : (
        <div className="w-full overflow-x-auto rounded-lg shadow-sm border border-gray-200">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-3">Học viên</th>
                <th className="px-6 py-3 text-center">Mã SV</th>
                <th className="px-6 py-3 text-center">Trạng thái (Enrollment)</th>
                <th className="px-6 py-3 text-right">Ngày vào lớp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-600 bg-white">
              {items.map((student) => (
                <tr key={student.studentId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{student.fullName}</div>
                  </td>
                  <td className="px-6 py-4 text-center font-mono text-xs text-gray-500">
                    {student.studentId}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <StatusBadge 
                      status={student.status === 'ACTIVE' ? 'active' : 'inactive'} 
                      label={student.status === 'ACTIVE' ? 'Đang học' : student.status} 
                    />
                  </td>
                  <td className="px-6 py-4 text-right">
                    {/* Giả sử student có trường joinDate hoặc createdAt - Fallback: hiển thị một cái gì đó */}
                    {new Date().toLocaleDateString('vi-VN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Thêm Học Viên */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Thêm học viên vào lớp</h3>
            <p className="text-sm text-gray-500 mb-6">
              Nhập ID Enrollment của học viên đã ghi danh (chưa được xếp vào lớp nào).
            </p>
            
            <form onSubmit={handleAddSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment ID</label>
                <input
                  type="text"
                  value={enrollmentId}
                  onChange={(e) => setEnrollmentId(e.target.value)}
                  placeholder="UUID của Enrollment"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm font-mono"
                  autoFocus
                />
                <p className="text-xs text-gray-400 mt-1">Lấy từ danh sách học viên → tab Ghi danh.</p>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setEnrollmentId(''); }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!enrollmentId.trim() || isAdding}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isAdding ? "Đang xử lý..." : "Xác nhận thêm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
