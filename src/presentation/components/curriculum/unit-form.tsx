import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Resolver } from "react-hook-form";
import { FormInput } from "../../../shared/ui/form/form-input";
import {
  createUnitFormSchema,
  type CreateUnitFormValues,
} from "../../../application/curriculum/forms/unit.form";

export interface UnitFormProps {
  initialValues?: Partial<CreateUnitFormValues>;
  onSubmit: (values: CreateUnitFormValues) => void;
  loading?: boolean;
}

/**
 * Form dùng để thêm mới hoặc sửa Unit
 */
export const UnitForm = ({
  initialValues,
  onSubmit,
  loading,
}: UnitFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUnitFormValues>({
    resolver: zodResolver(createUnitFormSchema) as unknown as Resolver<CreateUnitFormValues>,
    defaultValues: {
      unitNo: initialValues?.unitNo,
      title: initialValues?.title ?? "",
      totalLessons: initialValues?.totalLessons,
    },
  });

  const onSubmitHandler = (values: any) => {
    onSubmit(values as CreateUnitFormValues);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          id="unitNo"
          label="Số thứ tự Unit"
          type="number"
          placeholder="Ví dụ: 1"
          {...register("unitNo")}
          error={errors.unitNo?.message}
          required
        />

        <FormInput
          id="totalLessons"
          label="Tổng số bài học"
          type="number"
          placeholder="Ví dụ: 7"
          {...register("totalLessons")}
          error={errors.totalLessons?.message}
        />
      </div>

      <FormInput
        id="title"
        label="Tiêu đề Unit"
        placeholder="Nhập tiêu đề học phần..."
        {...register("title")}
        error={errors.title?.message}
        required
      />

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Đang xử lý..." : "Lưu Unit"}
        </button>
      </div>
    </form>
  );
};
