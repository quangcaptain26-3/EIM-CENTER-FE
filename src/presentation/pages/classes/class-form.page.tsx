import { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Trash2 } from "lucide-react";

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

const scheduleRowSchema = z
  .object({
    weekday: z.number().int().min(1).max(7),
    startTime: z.string().min(1, "Chọn giờ bắt đầu"),
    endTime: z.string().min(1, "Chọn giờ kết thúc"),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "Giờ kết thúc phải sau giờ bắt đầu",
    path: ["endTime"],
  });

const WEEKDAY_OPTIONS = [
  { value: "1", label: "Thứ 2" },
  { value: "2", label: "Thứ 3" },
  { value: "3", label: "Thứ 4" },
  { value: "4", label: "Thứ 5" },
  { value: "5", label: "Thứ 6" },
  { value: "6", label: "Thứ 7" },
  { value: "7", label: "Chủ nhật" },
];

const createClassFormSchema = z.object({
  class_code: z.string().min(1, "Mã lớp học không được để trống"),
  program_id: z.string().uuid("Vui lòng chọn chương trình học hợp lệ").min(1, "Vui lòng chọn chương trình học"),
  capacity: z.number().int("Sĩ số phải là số nguyên").min(1, "Sĩ số tối thiểu là 1").max(12, "Sĩ số tối đa là 12"),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày bắt đầu phải theo định dạng YYYY-MM-DD"),
  schedule_note: z.string().optional(),
  schedules: z.array(scheduleRowSchema).min(1, "Thêm ít nhất một buổi học trong tuần"),
  autoGenerateSessions: z.boolean(),
});

const editClassFormSchema = z.object({
  class_code: z.string().min(1, "Mã lớp học không được để trống"),
  program_id: z.string().uuid("Vui lòng chọn chương trình học hợp lệ").min(1, "Vui lòng chọn chương trình học"),
  capacity: z.number().int("Sĩ số phải là số nguyên").min(1, "Sĩ số tối thiểu là 1").max(12, "Sĩ số tối đa là 12"),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày bắt đầu phải theo định dạng YYYY-MM-DD"),
  schedule_note: z.string().optional(),
});

type CreateClassFormValues = z.infer<typeof createClassFormSchema>;
type EditClassFormValues = z.infer<typeof editClassFormSchema>;

export const ClassFormPage = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const mode = classId ? "edit" : "create";

  const { data: classData, isLoading: isLoadingClass, isError: isErrorClass, refetch } = useClass(mode === "edit" ? classId : undefined);
  const { data: programs, isLoading: isLoadingPrograms } = usePrograms();

  const { mutateAsync: createClass, isPending: isCreating } = useCreateClass();
  const { mutateAsync: updateClass, isPending: isUpdating } = useUpdateClass(classId);

  const schema = useMemo(
    () => (mode === "create" ? createClassFormSchema : editClassFormSchema),
    [mode],
  );

  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateClassFormValues | EditClassFormValues>({
    resolver: zodResolver(schema),
    defaultValues:
      mode === "create"
        ? {
            capacity: 12,
            class_code: "",
            program_id: "",
            start_date: "",
            schedule_note: "",
            schedules: [
              { weekday: 2, startTime: "18:00", endTime: "19:30" },
              { weekday: 4, startTime: "18:00", endTime: "19:30" },
            ],
            autoGenerateSessions: true,
          }
        : {
            capacity: 12,
            class_code: "",
            program_id: "",
            start_date: "",
            schedule_note: "",
            schedules: [],
          },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "schedules" as never,
    shouldUnregister: true,
  });

  useEffect(() => {
    if (mode === "edit" && classData) {
      reset({
        class_code: classData.code,
        program_id: classData.programId,
        capacity: classData.capacity,
        start_date: classData.startDate ? classData.startDate.split("T")[0] : "",
        schedule_note: classData.room || "",
      });
    }
  }, [mode, classData, reset]);

  const onSubmit = async (values: CreateClassFormValues | EditClassFormValues) => {
    try {
      if (mode === "create") {
        const v = values as CreateClassFormValues;
        const response = await createClass({
          code: v.class_code,
          name: v.class_code,
          programId: v.program_id,
          capacity: v.capacity,
          startDate: v.start_date,
          room: v.schedule_note,
          status: ClassStatus.ACTIVE,
          schedules: v.schedules.map((s) => ({
            weekday: s.weekday,
            startTime: s.startTime.length === 5 ? `${s.startTime}:00` : s.startTime,
            endTime: s.endTime.length === 5 ? `${s.endTime}:00` : s.endTime,
          })),
          autoGenerateSessions: v.autoGenerateSessions,
        });
        const newClassId = response?.data?.id;
        if (newClassId) {
          navigate(RoutePaths.CLASS_DETAIL.replace(":classId", newClassId));
        } else {
          navigate(RoutePaths.CLASSES);
        }
      } else {
        const v = values as EditClassFormValues;
        await updateClass({
          name: v.class_code,
          capacity: v.capacity,
          startDate: v.start_date,
          room: v.schedule_note,
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
  const autoGen = mode === "create" ? watch("autoGenerateSessions" as never) : false;

  return (
    <PageShell
      title={mode === "create" ? "Tạo lớp học mới" : "Sửa thông tin lớp"}
      subtitle={mode === "create" ? "Nhập thông tin để mở lớp mới" : `Đang chỉnh sửa lớp: ${classData?.code || ""}`}
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
              options={programs ? programs.map((p) => ({ label: p.name, value: p.id })) : []}
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

          {mode === "create" && (
            <div className="space-y-4 rounded-lg border border-indigo-100 bg-indigo-50/40 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Lịch học cố định (trong tuần)</h3>
                <button
                  type="button"
                  onClick={() => append({ weekday: 2, startTime: "18:00", endTime: "19:30" })}
                  className="inline-flex items-center gap-1 text-xs font-medium text-indigo-700 hover:text-indigo-900"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Thêm buổi
                </button>
              </div>
              <p className="text-xs text-gray-600">
                Mỗi dòng là một buổi trong tuần (ví dụ Thứ 3 + Thứ 5 = 2 buổi/tuần). Hệ thống dùng để sinh ngày học.
              </p>
              {(errors as { schedules?: { message?: string } }).schedules?.message && (
                <p className="text-sm text-red-600">{(errors as { schedules?: { message?: string } }).schedules?.message}</p>
              )}
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex flex-wrap items-end gap-3 rounded-md border border-gray-200 bg-white p-3"
                  >
                    <div className="min-w-[140px] flex-1">
                      <label className="mb-1 block text-xs font-medium text-gray-700">Thứ</label>
                      <select
                        className="w-full rounded-md border border-gray-300 px-2 py-2 text-sm"
                        {...register(`schedules.${index}.weekday` as const, { valueAsNumber: true })}
                      >
                        {WEEKDAY_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="min-w-[100px]">
                      <label className="mb-1 block text-xs font-medium text-gray-700">Bắt đầu</label>
                      <input
                        type="time"
                        className="w-full rounded-md border border-gray-300 px-2 py-2 text-sm"
                        {...register(`schedules.${index}.startTime` as const)}
                      />
                    </div>
                    <div className="min-w-[100px]">
                      <label className="mb-1 block text-xs font-medium text-gray-700">Kết thúc</label>
                      <input
                        type="time"
                        className="w-full rounded-md border border-gray-300 px-2 py-2 text-sm"
                        {...register(`schedules.${index}.endTime` as const)}
                      />
                    </div>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="rounded-md p-2 text-red-600 hover:bg-red-50"
                        title="Xóa dòng"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-800">
                <input type="checkbox" className="rounded border-gray-300" {...register("autoGenerateSessions")} />
                Tự động sinh buổi học (sessions) sau khi tạo lớp
              </label>
              {!autoGen && (
                <p className="text-xs text-amber-700">
                  Bạn có thể sinh buổi học sau từ trang chi tiết lớp (nút &quot;Sinh buổi học&quot;).
                </p>
              )}
            </div>
          )}

          <FormInput
            label="Ghi chú phòng / lịch (tuỳ chọn)"
            placeholder="Ví dụ: Phòng A — Tue/Thu"
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

export default ClassFormPage;
