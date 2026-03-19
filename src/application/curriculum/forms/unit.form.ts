import { z } from "zod";

/**
 * Schema cho form tạo Unit
 */
export const createUnitFormSchema = z.object({
  unitNo: z.coerce
    .number()
    .min(1, "Số thứ tự Unit phải lớn hơn 0"),
  title: z
    .string()
    .trim()
    .min(1, "Tiêu đề không được để trống"),
  totalLessons: z.coerce
    .number()
    .min(1, "Tổng số bài học phải lớn hơn 0")
    .optional(),
});

/**
 * Schema cho form cập nhật Unit
 */
export const updateUnitFormSchema = createUnitFormSchema.partial();

export type CreateUnitFormValues = z.infer<typeof createUnitFormSchema>;
export type UpdateUnitFormValues = z.infer<typeof updateUnitFormSchema>;

/**
 * Giá trị khởi tạo mặc định cho form tạo Unit
 */
export const defaultCreateUnitFormValues: Partial<CreateUnitFormValues> = {
  unitNo: undefined,
  title: "",
  totalLessons: undefined,
};
