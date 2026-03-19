import { useParams, useNavigate } from "react-router-dom";
import PageShell from "../../layouts/page-shell";
import { RoutePaths } from "@/app/router/route-paths";
import { ProgramForm } from "../../components/curriculum/program-form";
import {
  useCreateProgram,
  useUpdateProgram,
} from "../../hooks/curriculum/use-program-mutations";
import { useProgram } from "../../hooks/curriculum/use-programs";
import { Loading } from "../../../shared/ui/feedback/loading";
import { ErrorState } from "../../../shared/ui/feedback/error-state";
import type {
  CreateProgramFormValues,
  UpdateProgramFormValues,
} from "../../../application/curriculum/forms/program.form";

export const ProgramFormPage = () => {
  const { programId } = useParams<{ programId: string }>();
  const navigate = useNavigate();
  const mode = programId ? "edit" : "create";

  // Data queries & mutations
  const {
    data: program,
    isLoading,
    isError,
    refetch,
  } = useProgram(mode === "edit" ? programId : undefined);
  const { mutateAsync: createProgram, isPending: isCreating } =
    useCreateProgram();
  const { mutateAsync: updateProgram, isPending: isUpdating } =
    useUpdateProgram(programId);

  const handleSubmit = async (
    values: CreateProgramFormValues | UpdateProgramFormValues,
  ) => {
    try {
      if (mode === "create") {
        await createProgram(values as CreateProgramFormValues);
        navigate(RoutePaths.CURRICULUM_PROGRAMS);
      } else {
        await updateProgram(values as UpdateProgramFormValues);
        navigate(RoutePaths.CURRICULUM_PROGRAM_DETAIL.replace(':programId', programId as string));
      }
    } catch {
      // Errors handled smoothly by mutation hooks toast logic
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  // Nếu là mode edit và đang loading thì fetch init data
  if (mode === "edit" && isLoading) {
    return <Loading text="Đang tải dữ liệu chương trình..." />;
  }

  // Nếu là mode edit chẳng may lỗi
  if (mode === "edit" && isError) {
    return (
      <div className="p-8">
        <ErrorState onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <PageShell
      title={
        mode === "create" ? "Tạo chương trình học mới" : "Sửa chương trình học"
      }
      subtitle={
        mode === "create"
          ? "Nhập các thông tin cấu trúc, số buổi chi tiết cho học phần mới."
          : `Đang chỉnh sửa: ${program?.name}`
      }
    >
      <div className="max-w-4xl mx-auto pt-4">
        <ProgramForm
          mode={mode}
          initialValues={program || undefined}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={isCreating || isUpdating}
        />
      </div>
    </PageShell>
  );
};
