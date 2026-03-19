import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormInput } from "@/shared/ui/form/form-input";
import { FormSelect } from "@/shared/ui/form/form-select";
import {
  createProgramFormSchema,
  updateProgramFormSchema,
  type CreateProgramFormValues,
  type UpdateProgramFormValues,
} from "@/application/curriculum/forms/program.form";
import { PROGRAM_LEVELS } from "@/domain/curriculum/models/program.model";
import { getProgramLevelLabel } from "@/domain/curriculum/rules/curriculum.rule";

export interface ProgramFormProps {
  mode: "create" | "edit";
  initialValues?: Partial<CreateProgramFormValues | UpdateProgramFormValues>;
  onSubmit: (values: any) => void;
  onCancel?: () => void;
  loading?: boolean;
}

/**
 * Form tái sử dụng cho tạo mới và cập nhật Program
 */
export const ProgramForm = ({
  mode,
  initialValues,
  onSubmit,
  onCancel,
  loading,
}: ProgramFormProps) => {
  // Chọn schema tương ứng với mode
  const schema =
    mode === "create" ? createProgramFormSchema : updateProgramFormSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateProgramFormValues | UpdateProgramFormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      code: initialValues?.code ?? "",
      name: initialValues?.name ?? "",
      level: initialValues?.level as any,
      totalUnits: initialValues?.totalUnits as number | undefined,
      lessonsPerUnit: initialValues?.lessonsPerUnit as number | undefined,
      sessionsPerWeek: initialValues?.sessionsPerWeek as number | undefined,
    },
  });

  const levelOptions = PROGRAM_LEVELS.map((level) => ({
    value: level,
    label: getProgramLevelLabel(level),
  }));

  const onSubmitHandler = (values: any) => {
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-6">
      {/* Thông tin cơ bản */}
      <div className="curriculum-form-layout">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">
          Thông tin cơ bản
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            id="code"
            label="Mã chương trình"
            placeholder="VD: ENG-101"
            {...register("code")}
            error={errors.code?.message}
            required
            disabled={mode === "edit"} // Thường mã không đổi được khi edit, tuỳ spec BE
          />

          <FormSelect
            id="level"
            label="Cấp độ"
            options={levelOptions}
            {...register("level")}
            error={errors.level?.message}
            required
          />
        </div>

        <FormInput
          id="name"
          label="Tên chương trình"
          placeholder="Nhập tên chương trình đầy đủ..."
          {...register("name")}
          error={errors.name?.message}
          required
        />
      </div>

      {/* Cấu trúc thời lượng */}
      <div className="curriculum-form-layout">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">
          Cấu trúc và thời lượng
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormInput
            id="totalUnits"
            label="Tổng số Units"
            type="number"
            placeholder="VD: 12"
            {...register("totalUnits")}
            error={errors.totalUnits?.message}
            required
          />

          <FormInput
            id="lessonsPerUnit"
            label="Bài học / Unit"
            type="number"
            placeholder="VD: 4"
            {...register("lessonsPerUnit")}
            error={errors.lessonsPerUnit?.message}
            required
          />

          <FormInput
            id="sessionsPerWeek"
            label="Buổi học / Tuần"
            type="number"
            placeholder="VD: 2"
            {...register("sessionsPerWeek")}
            error={errors.sessionsPerWeek?.message}
            required
          />
        </div>
      </div>

      {/* Nút submit */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={() => (onCancel ? onCancel() : window.history.back())}
          className="px-6 py-2 border border-slate-300 text-slate-700 bg-white font-medium rounded-lg hover:bg-slate-50 transition"
          disabled={loading}
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? "Đang xử lý..."
            : mode === "create"
              ? "Tạo chương trình"
              : "Lưu thay đổi"}
        </button>
      </div>
    </form>
  );
};
