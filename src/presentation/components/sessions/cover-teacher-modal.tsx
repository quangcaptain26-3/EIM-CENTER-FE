import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User, Check } from "lucide-react";
import { Modal } from "@/shared/ui/modal";
import { useSetCoverTeacher } from "@/presentation/hooks/sessions";
import { AppRoles } from "@/shared/constants/roles";
import { Input } from "@/shared/ui/input";
import { Loading } from "@/shared/ui/feedback/loading";
import { EmptyState } from "@/shared/ui/feedback/empty";
import { apiClient } from "@/app/config/axios";

export interface CoverTeacherModalProps {
  sessionId: string;
  classId: string;
  currentTeacherName?: string | null;
  isOpen: boolean;
  onClose: () => void;
}

// Giả lập DTO user để không phụ thuộc cứng
interface UserDto {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
}

/**
 * Modal dùng để phân công giáo viên dạy thay (Cover Teacher).
 * Cho phép gọi API tìm kiếm user có role giáo viên.
 */
export const CoverTeacherModal = ({
  sessionId,
  classId,
  currentTeacherName,
  isOpen,
  onClose,
}: CoverTeacherModalProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);

  // Khởi tạo mutation logic
  const { mutate: setCoverTeacher, isPending } = useSetCoverTeacher(classId);

  // Lấy list giáo viên từ System/Users (giới hạn query lấy rule TEACHER)
  const { data: teachers, isLoading: isSearching } = useQuery({
    queryKey: ["users", "search-teachers", searchTerm],
    queryFn: async () => {
      // Vì hệ thống chưa chuẩn hóa hook cho Staff/Teacher search, dùng axios gọn lẹ
      const res = await apiClient.get<any>("/users", {
        params: {
          role: AppRoles.TEACHER,
          search: searchTerm || undefined,
          limit: 10,
        },
      });
      return res.data?.data?.items || [];
    },
    enabled: isOpen, // Chỉ gọi query nếu modal đang mở
  });

  // Handle lưu
  const handleConfirm = () => {
    // Nếu chọn rỗng = gỡ cover teacher
    setCoverTeacher(
      { sessionId, coverTeacherId: selectedTeacherId },
      {
        onSuccess: () => {
          setSelectedTeacherId(null);
          onClose();
        },
      }
    );
  };

  const handleClearCover = () => {
    setSelectedTeacherId(null);
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Gán giáo viên dạy thay"
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={isPending}
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700"
            disabled={isPending}
          >
            {isPending ? "Đang lưu..." : "Xác nhận"}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Banner tình trạng hiện hành */}
        <div className="bg-amber-50 rounded-lg p-4 border border-amber-100 flex items-start gap-3">
          <div className="bg-amber-100 rounded-full p-2 mt-0.5">
            <User className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-amber-900">Giáo viên phụ trách hiện tại</h4>
            <p className="text-sm text-amber-700 mt-1">
              {currentTeacherName || "Chưa phân công giáo viên chính"}
            </p>
          </div>
        </div>

        {/* Input search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tìm giáo viên dạy thay
          </label>
          <Input 
            placeholder="Nhập tên giáo viên..." 
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Kết quả search */}
        <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
          <div className="p-2">
            <button
              onClick={handleClearCover}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors flex justify-between items-center ${
                selectedTeacherId === null ? "bg-red-50 text-red-700" : "hover:bg-gray-50 text-gray-700"
              }`}
            >
              <span className="text-sm font-medium">Bỏ chọn dạy thay (Dạy chính)</span>
              {selectedTeacherId === null && <Check className="w-4 h-4" />}
            </button>
            <hr className="my-1 border-gray-100" />

            {isSearching ? (
              <Loading text="Đang tìm..." className="py-4" />
            ) : teachers?.length === 0 ? (
              <EmptyState title="Không tìm thấy giáo viên" description="Hãy thử từ khóa khác" className="py-4" />
            ) : (
              teachers?.map((t: UserDto) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTeacherId(t.id)}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors flex justify-between items-center ${
                    selectedTeacherId === t.id ? "bg-indigo-50 text-indigo-700" : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <div>
                    <div className="text-sm font-medium">{t.fullName}</div>
                    <div className="text-xs text-gray-500 opacity-80">{t.email}</div>
                  </div>
                  {selectedTeacherId === t.id && <Check className="w-4 h-4" />}
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
