import { useParams, useNavigate } from "react-router-dom";
import PageShell from "../../layouts/page-shell";
import { RoutePaths } from "@/app/router/route-paths";
import { useProgram } from "../../hooks/curriculum/use-programs";
import { useProgramUnits } from "../../hooks/curriculum/use-program-units";
import { ProgramSummary } from "../../components/curriculum/program-summary";
import { UnitList } from "../../components/curriculum/unit-list";
import { Loading } from "../../../shared/ui/feedback/loading";
import { ErrorState } from "../../../shared/ui/feedback/error-state";
import { ProtectedAction } from "../../components/common/protected-action";
import { useState } from "react";
import { CreateUnitModal } from "../../components/curriculum/create-unit-modal";
import { AppRoles } from "../../../shared/constants/roles";

export const ProgramDetailPage = () => {
  const { programId } = useParams<{ programId: string }>();
  const navigate = useNavigate();

  // Load program detail
  const {
    data: program,
    isLoading: isLoadingProgram,
    isError: isErrorProgram,
    refetch: refetchProgram,
  } = useProgram(programId);

  // Load danh sách units của program
  const {
    data: units,
    isLoading: isLoadingUnits,
    isError: isErrorUnits,
    refetch: refetchUnits,
  } = useProgramUnits(programId);

  const [isCreateUnitModalOpen, setIsCreateUnitModalOpen] = useState(false);

  const handleEditProgram = () => {
    navigate(RoutePaths.CURRICULUM_PROGRAM_EDIT.replace(':programId', programId as string));
  };

  const handleCreateUnit = () => {
    setIsCreateUnitModalOpen(true);
  };

  const handleEditUnit = (unitId: string) => {
    console.log("Edit unit:", unitId);
  };

  const handleViewLessons = (unitId: string) => {
    // TODO: navigate to lessons page or open modal
    console.log("View lessons for unit:", unitId);
  };

  // State loading chung
  if (isLoadingProgram)
    return <Loading text="Đang tải thông tin chương trình..." />;

  // State error chung
  if (isErrorProgram) {
    return (
      <div className="p-8">
        <ErrorState onRetry={() => refetchProgram()} />
      </div>
    );
  }

  // Not found fallback
  if (!program) {
    return (
      <div className="p-8">
        <ErrorState
          title="Không tìm thấy"
          message="Chương trình học không tồn tại hoặc đã bị xóa."
        />
      </div>
    );
  }

  return (
    <PageShell
      title={program.name}
      subtitle={`Chi tiết cấu trúc và học phần của chương trình`}
      actions={
        <div className="flex gap-2">
          <button
            onClick={() => navigate(RoutePaths.CURRICULUM_PROGRAMS)}
            className="px-4 py-2 border border-slate-300 text-slate-700 bg-white font-medium rounded-lg hover:bg-slate-50 transition"
          >
            Quay lại
          </button>

          <ProtectedAction
            allowedRoles={[AppRoles.ROOT, AppRoles.DIRECTOR, AppRoles.ACADEMIC]}
            fallback={<></>}
          >
            <button
              onClick={handleEditProgram}
              className="px-4 py-2 bg-indigo-50 text-indigo-700 font-medium rounded-lg hover:bg-indigo-100 transition"
            >
              Chỉnh sửa
            </button>
          </ProtectedAction>
        </div>
      }
    >
      <div className="max-w-6xl">
        {/* Phần Tóm tắt */}
        <ProgramSummary program={program} />

        {/* Phần danh sách Units */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800">
              Danh sách Unit (Học phần)
            </h2>
            <ProtectedAction
              allowedRoles={[
                AppRoles.ROOT,
                AppRoles.DIRECTOR,
                AppRoles.ACADEMIC,
              ]}
              fallback={<></>}
            >
              <button
                onClick={handleCreateUnit}
                className="text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition"
              >
                + Thêm Unit
              </button>
            </ProtectedAction>
          </div>

          {isLoadingUnits ? (
            <div className="py-8 bg-white border border-slate-200 rounded-xl">
              <Loading text="Đang tải danh sách unit..." />
            </div>
          ) : isErrorUnits ? (
            <ErrorState
              title="Lỗi tải danh sách Unit"
              onRetry={() => refetchUnits()}
            />
          ) : (
            <UnitList
              units={units || []}
              onViewUnit={handleViewLessons}
              onEditUnit={handleEditUnit}
            />
          )}
        </div>
      </div>

      {programId && (
        <CreateUnitModal
          open={isCreateUnitModalOpen}
          onClose={() => setIsCreateUnitModalOpen(false)}
          programId={programId}
        />
      )}
    </PageShell>
  );
};
