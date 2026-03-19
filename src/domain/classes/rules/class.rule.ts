import { z } from "zod";
import { ClassStatus } from "../models/class.model";

/**
 * Rules nghiệp vụ cho Lớp học (Class)
 * - Kiểm tra capacity (sĩ số) tối đa 12
 * - Kiểm tra trạng thái (status) hợp lệ theo enum ClassStatus của domain/backend
 * - Các rule này dùng chung cho form tạo mới và cập nhật
 */

/**
 * Schema validate form Lớp học
 */
export const ClassSchema = z.object({
  /** Tên lớp học bắt buộc, tối đa 100 ký tự */
  name: z
    .string()
    .min(1, "Vui lòng nhập tên lớp học")
    .max(100, "Tên lớp tối đa 100 ký tự"),

  /** Chương trình học bắt buộc */
  programId: z.string().min(1, "Vui lòng chọn chương trình học"),

  /** Ngày bắt đầu (yyyy-MM-dd) bắt buộc */
  startDate: z.string().min(1, "Vui lòng chọn ngày khai giảng"),

  /**
   * Trạng thái lớp học
   * Chỉ cho phép các giá trị hợp lệ trong ClassStatus
   */
  status: z.nativeEnum(ClassStatus, {
    message: "Trạng thái lớp học không hợp lệ",
  }),

  /**
   * Sĩ số lớp học
   * - Phải là số
   * - Tối thiểu 1
   * - Tối đa 12 (theo yêu cầu nghiệp vụ)
   */
  capacity: z
    .number({
      message: "Sĩ số phải là một số",
    })
    .min(1, "Sĩ số phải lớn hơn 0")
    .max(12, "Sĩ số tối đa là 12"),
});

/**
 * Kiểu dữ liệu cho Form Lớp học, dùng kèm với React Hook Form
 */
export type ClassFormValues = z.infer<typeof ClassSchema>;

