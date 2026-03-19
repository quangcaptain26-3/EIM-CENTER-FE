import { z } from 'zod';
import { ENROLLMENT_STATUS_VALUES } from '@/domain/students/models/enrollment.model';

/**
 * Schema kiểm tra dữ liệu form đăng ký học viên vào lớp (Tạo mới ghi danh)
 */
export const createEnrollmentFormSchema = z.object({
  studentId: z.string().min(1, 'Chưa chọn học viên'),
  classId: z.string().min(1, 'Chưa chọn lớp học'),
  startDate: z.string().min(1, 'Ngày bắt đầu không được để trống'),
});

/**
 * Schema kiểm tra dữ liệu form cập nhật trạng thái ghi danh
 */
export const updateEnrollmentStatusFormSchema = z.object({
  status: z.enum(ENROLLMENT_STATUS_VALUES as [string, ...string[]]).refine((val) => val !== undefined, {
    message: 'Chưa chọn trạng thái',
  }),
  note: z.string().optional(),
});

/**
 * Schema kiểm tra dữ liệu form chuyển lớp
 */
export const transferEnrollmentFormSchema = z.object({
  toClassId: z.string().min(1, 'Chưa chọn lớp đích để chuyển'),
  note: z.string().optional(),
});

/**
 * Kiểu dữ liệu trích xuất từ schema tạo ghi danh
 */
export type CreateEnrollmentFormValues = z.infer<typeof createEnrollmentFormSchema>;

/**
 * Kiểu dữ liệu trích xuất từ schema cập nhật trạng thái
 */
export type UpdateEnrollmentStatusFormValues = z.infer<typeof updateEnrollmentStatusFormSchema>;

/**
 * Kiểu dữ liệu trích xuất từ schema chuyển lớp
 */
export type TransferEnrollmentFormValues = z.infer<typeof transferEnrollmentFormSchema>;

/**
 * Giá trị mặc định cho form tạo ghi danh
 */
export const defaultCreateEnrollmentFormValues: CreateEnrollmentFormValues = {
  studentId: '',
  classId: '',
  startDate: '',
};

/**
 * Giá trị mặc định cho form cập nhật trạng thái
 */
export const defaultUpdateEnrollmentStatusFormValues: UpdateEnrollmentStatusFormValues = {
  status: 'ACTIVE',
  note: '',
};

/**
 * Giá trị mặc định cho form chuyển lớp
 */
export const defaultTransferEnrollmentFormValues: TransferEnrollmentFormValues = {
  toClassId: '',
  note: '',
};
