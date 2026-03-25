import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { RoutePaths } from '@/app/router/route-paths';

import { PageShell } from '../../components/common/page-shell';
import { SearchBox } from '@/presentation/components/common/search-box';
import { ProtectedAction } from '@/presentation/components/common/protected-action';
import { ExportExcelButton } from '@/presentation/components/common/export-excel-button';
import { StudentTable } from '@/presentation/components/students/student-table';
import { useStudents } from '@/presentation/hooks/students';
import { useStudentsPermission } from '@/presentation/hooks/students/use-students-permission';
import { usePagination } from '@/shared/hooks/use-pagination';
import { useMutation } from '@tanstack/react-query';
import { studentsApi } from '@/infrastructure/services/students.api';
import { toastAdapter } from '@/infrastructure/adapters/toast.adapter';
import { mapHttpError } from '@/infrastructure/http/http-error.mapper';

/**
 * Trang danh sách học viên chính
 */
export default function StudentListPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  // SearchBox dùng debounceMs=300 nội bộ, searchTerm đã debounced khi onChange

  // Pagination hook nội bộ
  const { page, limit, offset, setPage, setLimit } = usePagination({ initialLimit: 10 });

  // Gọi API lấy list students từ React Query hook
  const { data, isLoading, isError } = useStudents({
    search: searchTerm,
    limit,
    offset,
  });

  const { canRead } = useStudentsPermission();

  const exportMutation = useMutation({
    mutationFn: () =>
      studentsApi.exportStudentsExcel({
        search: searchTerm || undefined,
        limit: 5000,
      }),
    onMutate: () => {
      toastAdapter.info('Bắt đầu xuất Excel. Nếu dữ liệu lớn, vui lòng chờ trong giây lát...');
    },
    onSuccess: () => {
      toastAdapter.success('Đã hoàn tất xử lý và bắt đầu tải file Excel.');
    },
    onError: (error) => {
      toastAdapter.error(mapHttpError(error));
    },
  });

  const students = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  // Thao tác xem chi tiết & sửa
  const handleView = useCallback((studentId: string) => {
    navigate(RoutePaths.STUDENT_DETAIL.replace(':id', studentId));
  }, [navigate]);

  const handleEdit = useCallback((studentId: string) => {
    navigate(RoutePaths.STUDENT_EDIT.replace(':id', studentId));
  }, [navigate]);

  const handleCreate = useCallback(() => {
    navigate(RoutePaths.STUDENT_NEW);
  }, [navigate]);

  if (isError) {
    // Thường có chung 1 error boundary, hoặc có thể custom UI error tại đây.
    return (
      <PageShell title="Học viên">
         <div className="text-red-500 py-10 text-center">Đã có lỗi xảy ra khi lấy danh sách học viên.</div>
      </PageShell>
    );
  }

  return (
    <PageShell 
      title="Quản lý Học viên"
      description="Đăng ký, tra cứu thông tin học viên & ghi danh tại trung tâm."
      actions={
        <>
          <ProtectedAction allowedRoles={['ROOT', 'ACADEMIC']}>
            <button
              onClick={handleCreate}
              type="button"
              className="px-4 py-2 bg-primary text-white hover:bg-primary-light rounded-md transition-colors flex items-center gap-2 shadow-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm mới</span>
            </button>
          </ProtectedAction>

          <ExportExcelButton
            onExport={() => exportMutation.mutateAsync()}
            disabled={!canRead}
            isLoading={exportMutation.isPending}
            title={!canRead ? 'Bạn không có quyền xem dữ liệu học viên.' : 'Xuất danh sách học viên ra Excel'}
            label="Xuất Excel"
          />
        </>
      }
    >
        <div className="flex flex-col gap-6">
          {exportMutation.isPending && (
            <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-md px-3 py-2">
              Hệ thống đang chuẩn bị file export. Nếu chưa thấy tải xuống ngay, vui lòng chờ thêm một chút và không bấm lặp.
            </div>
          )}
          {/* Thanh công cụ: Tiêu đề + Search */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="w-full sm:w-1/3">
              <SearchBox
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Tìm theo tên, SĐT, email, SĐT phụ huynh..."
              />
            </div>
            {/* Có thể thêm các filter khác tại đây */}
          </div>

          {/* Bảng danh sách */}
          <StudentTable
            items={students}
            loading={isLoading}
            onView={handleView}
            onEdit={handleEdit}
          />

          {/* Phân trang đơn giản */}
          {!isLoading && total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between py-4 border-t border-gray-100 gap-4">
              <span className="text-sm text-gray-500">
                Hiển thị <span className="font-semibold text-gray-900">{students.length}</span> trên tổng số <span className="font-semibold text-gray-900">{total}</span> học viên
              </span>
              
              <div className="flex items-center gap-2">
                <select
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value={10}>10/trang</option>
                  <option value={20}>20/trang</option>
                  <option value={50}>50/trang</option>
                </select>

                <div className="flex gap-1">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="px-3 py-1.5 border border-gray-200 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Trước
                  </button>
                  <span className="px-4 py-1.5 flex items-center justify-center text-sm font-medium bg-gray-50 border border-gray-200 rounded-md">
                    {page} / {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                    className="px-3 py-1.5 border border-gray-200 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Sau
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </PageShell>
  );
}
