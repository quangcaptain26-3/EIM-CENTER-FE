import { useNavigate } from "react-router-dom";
import { RoutePaths } from "@/app/router/route-paths";
import PageShell from "../../layouts/page-shell";
import { usePrograms } from "../../hooks/curriculum/use-programs";
import { ProgramCard } from "../../components/curriculum/program-card";
import { ProtectedAction } from "../../components/common/protected-action";
import { Loading } from "../../../shared/ui/feedback/loading";
import { ErrorState } from "../../../shared/ui/feedback/error-state";
import { EmptyState } from "../../../shared/ui/feedback/empty";
import { AppRoles } from "../../../shared/constants/roles";

export const ProgramListPage = () => {
  const navigate = useNavigate();
  const { data: programs, isLoading, isError, refetch } = usePrograms();

  const handleCreateProgram = () => {
    navigate(RoutePaths.CURRICULUM_PROGRAM_NEW);
  };

  const handleViewProgram = (id: string) => {
    navigate(RoutePaths.CURRICULUM_PROGRAM_DETAIL.replace(':programId', id));
  };

  return (
    <PageShell
      title="Chương trình học"
      subtitle="Quản lý cấu trúc, bài giảng và thời lượng giáo trình"
      actions={
        <ProtectedAction
          allowedRoles={[AppRoles.ROOT, AppRoles.DIRECTOR, AppRoles.ACADEMIC]}
          fallback={<></>}
        >
          <button
            onClick={handleCreateProgram}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
          >
            <span className="text-xl leading-none mb-0.5">+</span>
            <span>Tạo chương trình</span>
          </button>
        </ProtectedAction>
      }
    >
      <div className="mt-2">
        {isLoading && <Loading text="Đang tải danh sách chương trình..." />}

        {isError && (
          <ErrorState
            title="Lỗi tải dữ liệu"
            message="Không thể lấy danh sách chương trình học lúc này."
            onRetry={handleRetryList}
          />
        )}

        {!isLoading && !isError && programs?.length === 0 && (
          <EmptyState
            title="Chưa có chương trình nào"
            description="Có vẻ như trung tâm chưa tạo chương trình giảng dạy nào."
          />
        )}

        {!isLoading && !isError && programs && programs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {programs.map((program) => (
              <ProgramCard
                key={program.id}
                program={program}
                onView={handleViewProgram}
              />
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );

  function handleRetryList() {
    refetch();
  }
};
