import { z } from "zod";
import { PROGRAM_LEVELS } from "../../../domain/curriculum/models/program.model";

/**
 * Schema cho form tạo Program
 */
export const createProgramFormSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, "Mã chương trình phải có ít nhất 2 ký tự"),
  name: z
    .string()
    .trim()
    .min(1, "Tên chương trình không được để trống"),
  level: z.enum(PROGRAM_LEVELS, "Cấp độ là bắt buộc"),
  totalUnits: z.coerce
    .number()
    .min(1, "Tổng số units phải lớn hơn 0"),
  lessonsPerUnit: z.coerce
    .number()
    .min(1, "Số bài học/unit phải lớn hơn 0")
    .default(7),
  sessionsPerWeek: z.coerce
    .number()
    .min(1, "Số buổi/tuần phải lớn hơn 0")
    .default(2),
  feePlanId: z.string().optional(),
});

/**
 * Schema cho form cập nhật Program
 */
export const updateProgramFormSchema = createProgramFormSchema.partial();

export type CreateProgramFormValues = z.infer<typeof createProgramFormSchema>;
export type UpdateProgramFormValues = z.infer<typeof updateProgramFormSchema>;

/**
 * Giá trị khởi tạo mặc định cho form tạo Program
 */
export const defaultCreateProgramFormValues: Partial<CreateProgramFormValues> = {
  code: "",
  name: "",
  level: undefined,
  totalUnits: undefined,
  lessonsPerUnit: 7,
  sessionsPerWeek: 2,
  feePlanId: "",
};
