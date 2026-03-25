import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../../layouts/page-shell";
import { useClasses } from "../../hooks/classes/use-classes";
import { usePrograms } from "../../hooks/curriculum/use-programs";
import { ClassTable } from "../../components/classes/class-table";
import { ProtectedAction } from "../../components/common/protected-action";
import { ErrorState } from "../../../shared/ui/feedback/error-state";
import { AppRoles } from "../../../shared/constants/roles";
import { ClassStatus } from "../../../domain/classes/models/class.model";
import { RoutePaths } from "../../../app/router/route-paths";
import { SearchBox } from "../../components/common/search-box";

export const ClassListPage = () => {
  const navigate = useNavigate();

  // Filter state — SearchBox dùng debounceMs=300 nội bộ
  const [search, setSearch] = useState("");
  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<ClassStatus | "">("");

  // Data fetching
  const { data: classData, isLoading, isError, refetch } = useClasses({
    search: search || undefined,
    programId: selectedProgram || undefined,
    status: selectedStatus || undefined,
    limit: 50, // Temporary unpaginated approach or large limit
  });

  const { data: programs } = usePrograms();

  const handleCreateClass = () => {
    navigate(RoutePaths.CLASS_NEW);
  };

  const handleViewClass = (id: string) => {
    navigate(RoutePaths.CLASS_DETAIL.replace(":classId", id));
  };

  const handleEditClass = (id: string) => {
    navigate(RoutePaths.CLASS_EDIT.replace(":classId", id));
  };

  return (
    <PageShell
      title="Lớp học"
      subtitle="Quản lý danh sách các lớp học theo chương trình"
      actions={
        <ProtectedAction
          allowedRoles={[AppRoles.ROOT, AppRoles.ACADEMIC]}
          fallback={<></>}
        >
          <button
            onClick={handleCreateClass}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
          >
            <span className="text-xl leading-none mb-0.5">+</span>
            <span>Tạo lớp mới</span>
          </button>
        </ProtectedAction>
      }
    >
      <div className="flex flex-col gap-6 mt-2">
        {/* Bộ lọc */}
        <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex-1 min-w-[200px]">
            <SearchBox
              value={search}
              onChange={setSearch}
              placeholder="Tìm theo mã hoặc tên lớp..."
            />
          </div>

          <div className="w-full sm:w-auto">
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="w-full form-select block px-3 py-2 text-sm border-gray-200 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Tất cả chương trình</option>
              {programs?.map((prog) => (
                <option key={prog.id} value={prog.id}>
                  {prog.name}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-auto">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as ClassStatus | "")}
              className="w-full form-select block px-3 py-2 text-sm border-gray-200 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value={ClassStatus.ACTIVE}>Hoạt động</option>
              <option value={ClassStatus.PAUSED}>Tạm dừng</option>
              <option value={ClassStatus.CLOSED}>Đã đóng</option>
            </select>
          </div>
        </div>

        {/* Bảng dữ liệu */}
        {isError ? (
          <ErrorState
            title="Không thể tải danh sách lớp học"
            message="Đã có lỗi xảy ra trong quá trình lấy dữ liệu. Vui lòng thử lại sau."
            onRetry={handleRetryList}
          />
        ) : (
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-lg">
                <div className="flex bg-white shadow-md rounded-full px-4 py-2 items-center gap-2 text-sm font-medium text-indigo-600">
                  <svg className="animate-spin h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang tải...
                </div>
              </div>
            )}
            
            <ClassTable
              classes={classData?.items || []}
              onView={handleViewClass}
              onEdit={handleEditClass}
            />
          </div>
        )}
      </div>
    </PageShell>
  );

  function handleRetryList() {
    refetch();
  }
};
