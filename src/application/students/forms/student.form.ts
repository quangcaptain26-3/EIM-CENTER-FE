import { z } from 'zod';

/**
 * Schema kiểm tra dữ liệu form tạo học viên
 */
export const createStudentFormSchema = z.object({
  fullName: z.string().min(1, 'Họ và tên không được để trống'),
  dob: z.string().optional(),
  gender: z.string().optional(),
  // Sửa [A2-1]: Validate định dạng số điện thoại Việt Nam (10 số, bắt đầu bằng 0)
  phone: z
    .string()
    .refine((val) => val === '' || /^0\d{9}$/.test(val), {
      message: 'Số điện thoại phải có 10 số và bắt đầu bằng 0',
    })
    .optional(),
  email: z
    .string()
    .email('Định dạng email không hợp lệ')
    .optional()
    .or(z.literal('')), // Cho phép rỗng
  guardianName: z.string().optional(),
  // Sửa [A2-1]: Validate định dạng SĐT cho người giám hộ
  guardianPhone: z
    .string()
    .refine((val) => val === '' || /^0\d{9}$/.test(val), {
      message: 'Số điện thoại người giám hộ phải có 10 số và bắt đầu bằng 0',
    })
    .optional(),
  address: z.string().optional(),
});

/**
 * Schema kiểm tra dữ liệu form cập nhật học viên
 */
export const updateStudentFormSchema = createStudentFormSchema.partial();

/**
 * Kiểu dữ liệu trích xuất từ schema tạo học viên
 */
export type CreateStudentFormValues = z.infer<typeof createStudentFormSchema>;

/**
 * Kiểu dữ liệu trích xuất từ schema cập nhật học viên
 */
export type UpdateStudentFormValues = z.infer<typeof updateStudentFormSchema>;

/**
 * Giá trị mặc định cho form học viên mới
 */
export const defaultStudentFormValues: CreateStudentFormValues = {
  fullName: '',
  dob: '',
  gender: '',
  phone: '',
  email: '',
  guardianName: '',
  guardianPhone: '',
  address: '',
};
