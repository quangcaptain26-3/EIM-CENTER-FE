import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import PageShell from "../../layouts/page-shell";
import { useClass } from "../../hooks/classes/use-classes";
import { usePrograms } from "../../hooks/curriculum/use-programs";
import { useCreateClass, useUpdateClass } from "../../hooks/classes/use-class-mutations";

import { mapValidationErrors } from "../../../infrastructure/http/http-error.mapper";
import { FormInput } from "../../../shared/ui/form/form-input";
import { FormSelect } from "../../../shared/ui/form/form-select";
import { Loading } from "../../../shared/ui/feedback/loading";
import { ErrorState } from "../../../shared/ui/feedback/error-state";
import { RoutePaths } from "../../../app/router/route-paths";
import { ClassStatus } from "../../../domain/classes/models/class.model";

// 1. Schema Validation (React Hook Form + Zod)
const classFormSchema = z.object({
  class_code: z.string().min(1, "Mã lớp học không được để trống"),
  program_id: z.string().uuid("Vui lòng chọn chương trình học hợp lệ").min(1, "Vui lòng chọn chương trình học"),
  capacity: z.number().int("Sĩ số phải là số nguyên").min(1, "Sĩ số tối thiểu là 1").max(12, "Sĩ số tối đa là 12"),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày bắt đầu phải theo định dạng YYYY-MM-DD"),
  schedule_note: z.string().optional(),
});

type ClassFormValues = z.infer<typeof classFormSchema>;

export const ClassFormPage = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const mode = classId ? "edit" : "create";

  // Data fetching
  const { data: classData, isLoading: isLoadingClass, isError: isErrorClass, refetch } = useClass(mode === "edit" ? classId : undefined);
  const { data: programs, isLoading: isLoadingPrograms } = usePrograms();

  const { mutateAsync: createClass, isPending: isCreating } = useCreateClass();
  const { mutateAsync: updateClass, isPending: isUpdating } = useUpdateClass(classId);

  // Form Setup
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ClassFormValues>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      capacity: 12,
      class_code: "",
      program_id: "",
      start_date: "",
      schedule_note: "",
    },
  });

  // Load initial data for edit mode
  useEffect(() => {
    if (mode === "edit" && classData) {
      reset({
        class_code: classData.code,
        program_id: classData.programId,
        capacity: classData.capacity,
        start_date: classData.startDate ? classData.startDate.split('T')[0] : "",
        schedule_note: classData.room || "", // Map room tới schedule_note tạm thời
      });
    }
  }, [mode, classData, reset]);

    const onSubmit = async (values: ClassFormValues) => {
      try {
        if (mode === "create") {
          const response = await createClass({
            code: values.class_code,
            name: values.class_code, // Tên mặc định lấy theo mã lớp
            programId: values.program_id,
            capacity: values.capacity,
            startDate: values.start_date,
            room: values.schedule_note, // Lưu ghi chú lịch học vào trường room (phòng học)
            status: ClassStatus.ACTIVE,
          });
          // Redirect to class detail using the id from response
          const newClassId = response?.data?.id;
          if (newClassId) {
            navigate(RoutePaths.CLASS_DETAIL.replace(":classId", newClassId));
          } else {
            navigate(RoutePaths.CLASSES);
          }
        } else {
          await updateClass({
            name: values.class_code, // Chỉnh sửa tên lớp theo mã mới luôn
            capacity: values.capacity,
            startDate: values.start_date,
            room: values.schedule_note,
          });
          navigate(RoutePaths.CLASS_DETAIL.replace(":classId", classId as string));
        }
      } catch (error) {
        mapValidationErrors(error, setError);
        console.error(error);
      }
    };

  if (mode === "edit" && isLoadingClass) return <Loading text="Đang tải dữ liệu lớp học..." />;
  if (mode === "edit" && isErrorClass) return <div className="p-8"><ErrorState onRetry={() => refetch()} /></div>;

  const isPending = isCreating || isUpdating || isSubmitting;

  return (
    <PageShell
      title={mode === "create" ? "Tạo lớp học mới" : "Sửa thông tin lớp"}
      subtitle={mode === "create" ? "Nhập thông tin để mở lớp mới" : `Đang chỉnh sửa lớp: ${classData?.code || ''}`}
    >
      <div className="max-w-2xl mx-auto pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Mã lớp"
              placeholder="Ví dụ: ILTS-001"
              required
              {...register("class_code")}
              error={errors.class_code?.message}
            />

            <FormSelect
              label="Chương trình học"
              required
              {...register("program_id")}
              error={errors.program_id?.message}
              disabled={isLoadingPrograms}
              placeholder="-- Chọn chương trình học --"
              options={programs ? programs.map(p => ({ label: p.name, value: p.id })) : []}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormInput
              type="number"
              label="Sĩ số (tối đa)"
              required
              {...register("capacity", { valueAsNumber: true })}
              error={errors.capacity?.message}
            />

            <FormInput
              type="date"
              label="Ngày bắt đầu"
              required
              {...register("start_date")}
              error={errors.start_date?.message}
              className="md:col-span-2"
            />
          </div>

          <FormInput
            label="Ghi chú lịch học"
            placeholder="Ví dụ: Tue/Thu"
            {...register("schedule_note")}
            error={errors.schedule_note?.message}
          />

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
            >
              {isPending && (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {mode === "create" ? "Tạo lớp học" : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </PageShell>
  );
};
