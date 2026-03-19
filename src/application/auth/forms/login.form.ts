// login.form.ts
// Schema form đăng nhập dùng Zod – validate phía client trước khi gọi API.
// Message lỗi bằng tiếng Việt để UX thân thiện với người dùng.

import { z } from 'zod';

/** Schema validation cho form đăng nhập */
export const loginFormSchema = z.object({
  // Email bắt buộc và phải đúng định dạng
  email: z
    .string()
    .min(1, 'Vui lòng nhập email')
    .email('Email không đúng định dạng'),

  // Mật khẩu bắt buộc, tối thiểu 6 ký tự
  password: z
    .string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

/** Kiểu dữ liệu được suy ra từ schema – dùng trong React Hook Form */
export type LoginFormValues = z.infer<typeof loginFormSchema>;

/** Giá trị mặc định khi khởi tạo form */
export const defaultLoginFormValues: LoginFormValues = {
  email: '',
  password: '',
};
