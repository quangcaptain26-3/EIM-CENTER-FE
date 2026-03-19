import { Eye, Edit } from "lucide-react";

import type { ClassModel } from "@/domain/classes/models/class.model";
import { ClassStatus } from "@/domain/classes/models/class.model";
import { ProtectedAction } from "../common/protected-action";
import { AppRoles } from "@/shared/constants/roles";


interface ClassTableProps {
  classes: ClassModel[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
}

export const ClassTable = ({ classes, onView, onEdit }: ClassTableProps) => {
  const getStatusBadge = (status: ClassStatus) => {
    switch (status) {
      case ClassStatus.ACTIVE:
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
            Hoạt động
          </span>
        );
      case ClassStatus.PAUSED:
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-700">
            Tạm dừng
          </span>
        );
      case ClassStatus.CLOSED:
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
            Đã đóng
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              <th scope="col" className="px-6 py-4 font-medium">
                Mã lớp
              </th>
              <th scope="col" className="px-6 py-4 font-medium">
                Chương trình
              </th>
              <th scope="col" className="px-6 py-4 font-medium text-center">
                Sĩ số
              </th>
              <th scope="col" className="px-6 py-4 font-medium">
                Khởi giảng
              </th>
              <th scope="col" className="px-6 py-4 font-medium text-center">
                Trạng thái
              </th>
              <th scope="col" className="px-6 py-4 font-medium text-right">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {classes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Không tìm thấy lớp học nào.
                </td>
              </tr>
            ) : (
              classes.map((cls) => (
                <tr
                  key={cls.id}
                  className="hover:bg-gray-50/80 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onView(cls.id)}
                      className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                    >
                      {cls.code}
                    </button>
                    {cls.name !== cls.code && (
                      <div className="text-xs text-gray-500 mt-0.5">{cls.name}</div>
                    )}
                  </td>
                  <td
                    className="px-6 py-4 text-gray-700 truncate max-w-[240px]"
                    title={cls.programName ?? cls.programId}
                  >
                    {cls.programName ?? cls.programId}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-medium">{cls.currentSize ?? 0}</span>
                    <span className="text-gray-400 mx-1">/</span>
                    <span className="text-gray-600">{cls.capacity}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {formatDate(cls.startDate)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {getStatusBadge(cls.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onView(cls.id)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-md hover:bg-indigo-50 transition"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      <ProtectedAction
                        allowedRoles={[AppRoles.ROOT, AppRoles.ACADEMIC]}
                        fallback={<></>}
                      >
                        <button
                          onClick={() => onEdit(cls.id)}
                          className="p-1.5 text-gray-400 hover:text-amber-600 rounded-md hover:bg-amber-50 transition"
                          title="Sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </ProtectedAction>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
