import { useState } from 'react';
import { useAssignStaff, useRemoveStaff } from '../../hooks/classes/use-class-mutations';
import type { ClassStaffResponseDto } from '../../../application/classes/dto/classes.dto';
import { FormInput } from '../../../shared/ui/form/form-input';
import { FormSelect } from '../../../shared/ui/form/form-select';
import { Trash2, UserPlus, GraduationCap, AlertCircle } from 'lucide-react';
import { ProtectedAction } from '../../components/common/protected-action';
import { AppRoles } from '../../../shared/constants/roles';

export interface ClassStaffTabProps {
  classId: string;
  defaultStaff: ClassStaffResponseDto[];
}

export const ClassStaffTab = ({ classId, defaultStaff }: ClassStaffTabProps) => {
  const [newStaffId, setNewStaffId] = useState('');
  const [newRole, setNewRole] = useState<'MAIN' | 'TA'>('MAIN');

  const { mutate: assignStaff, isPending: isAssigning } = useAssignStaff(classId);
  const { mutate: removeStaff, isPending: isRemoving } = useRemoveStaff(classId);

  // Thêm nhân sự mới vào lớp
  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffId.trim()) return;

    assignStaff(
      { userId: newStaffId, type: newRole },
      {
        onSuccess: () => {
          setNewStaffId('');
        },
      }
    );
  };

  // Xóa nhân sự khỏi lớp
  const handleRemove = (staffId: string, type: 'MAIN' | 'TA') => {
    if (window.confirm('Bạn có chắc chắn muốn hủy phân công vai trò này khỏi lớp học?')) {
      removeStaff({ userId: staffId, type });
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Cấu hình nhân sự</h2>
        <p className="text-sm text-gray-500">Phân công giáo viên chính và trợ giảng phụ trách cho lớp học.</p>
      </div>

      <ProtectedAction allowedRoles={[AppRoles.ROOT, AppRoles.ACADEMIC]}>
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Phân công mới
          </h3>
          
          <form onSubmit={handleAssign} className="flex flex-col sm:flex-row items-end gap-4">
            <div className="flex-1 w-full">
              <FormInput 
                id="staffId"
                label="Mã giáo viên / Trợ giảng (User ID)"
                value={newStaffId} 
                onChange={(e) => setNewStaffId(e.target.value)} 
                placeholder="Nhập mã nhân viên hoặc UUID..." 
              />
            </div>
            <div className="w-full sm:w-1/3">
              <FormSelect 
                id="staffRole"
                label="Vai trò giảng dạy"
                value={newRole} 
                onChange={(e) => setNewRole(e.target.value as 'MAIN' | 'TA')} 
                options={[
                  { label: 'Giáo viên chính (MAIN)', value: 'MAIN' },
                  { label: 'Trợ giảng (TA)', value: 'TA' }
                ]}
              />
            </div>
            
            <button
              type="submit"
              disabled={isAssigning || !newStaffId.trim()}
              className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 h-10 w-full sm:w-auto disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
            >
              {isAssigning ? "Đang xử lý..." : "Thêm phân công"}
            </button>
          </form>
          <div className="text-xs text-amber-600 flex items-start gap-1">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="leading-snug">Vui lòng nhập đúng ID (UUID) của Teacher. Module Search Staff sẽ được cập nhật tích hợp sau.</span>
          </div>
        </div>
      </ProtectedAction>

      <div className="w-full overflow-x-auto rounded-xl shadow-sm border border-gray-200">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 w-1/3">Nhân sự</th>
              <th className="px-6 py-4 w-1/3">Vai trò đảm nhận</th>
              <th className="px-6 py-4 text-center">Ngày phân công</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-600 bg-white">
            {defaultStaff.map((staff) => (
              <tr key={`${staff.id}-${staff.type}`} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-900">
                    {staff.userFullName?.trim()
                      ? staff.userFullName
                      : `Người dùng: ${staff.userId.substring(0, 8)}...`}
                  </div>
                  <div className="text-xs text-gray-400 font-mono mt-0.5">{staff.userId}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold ${
                    staff.type === 'MAIN' 
                      ? 'bg-blue-50 text-blue-700 border-blue-100 border'
                      : 'bg-purple-50 text-purple-700 border-purple-100 border'
                  }`}>
                    <GraduationCap className="w-3.5 h-3.5" />
                    {staff.type === 'MAIN' ? 'Giáo viên chính' : 'Trợ giảng'}
                  </span>
                </td>
                <td className="px-6 py-4 text-center text-gray-500">
                  {staff.assignedAt ? new Date(staff.assignedAt).toLocaleDateString('vi-VN') : 'N/A'}
                </td>
                <td className="px-6 py-4 text-right">
                  <ProtectedAction allowedRoles={[AppRoles.ROOT, AppRoles.ACADEMIC]}>
                    <button
                      onClick={() => handleRemove(staff.userId, staff.type)}
                      disabled={isRemoving}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Xoá phân công"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </ProtectedAction>
                </td>
              </tr>
            ))}
            {defaultStaff.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center flex flex-col items-center">
                  <GraduationCap className="w-8 h-8 text-gray-300 mb-2" />
                  <p className="text-gray-500 font-medium">Chưa có giáo viên nào</p>
                  <span className="text-gray-400 text-sm mt-1">Sử dụng form trên để phân công nhiệm vụ cho lớp học này.</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
