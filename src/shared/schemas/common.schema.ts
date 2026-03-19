// common.schema.ts
// Các Zod schema tái sử dụng cho các trường phổ biến.
// Giúp các form schema khác gọn hơn và validate nhất quán.

import { z } from 'zod';

/** Schema email chuẩn – bắt buộc, đúng định dạng */
export const emailSchema = z
  .string()
  .min(1, 'Vui lòng nhập email')
  .email('Email không đúng định dạng');

/** Schema chuỗi không rỗng, tự động trim khoảng trắng */
export const requiredStringSchema = (fieldLabel = 'Trường này') =>
  z
    .string()
    .min(1, `${fieldLabel} không được để trống`)
    .transform((val) => val.trim());

/** Schema UUID đơn giản – dùng để validate id từ API */
export const uuidSchema = z
  .string()
  .uuid('Định dạng ID không hợp lệ');
