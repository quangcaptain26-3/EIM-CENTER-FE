/**
 * Mô hình dữ liệu học viên tại frontend
 */
export type StudentModel = {
  id: string; // ID duy nhất của học viên
  fullName: string; // Họ và tên
  dob?: string; // Ngày sinh (ISO string hoặc YYYY-MM-DD)
  gender?: string; // Giới tính (ví dụ: MALE, FEMALE, OTHER)
  phone?: string; // Số điện thoại liên hệ
  email?: string; // Địa chỉ email
  guardianName?: string; // Tên người giám hộ
  guardianPhone?: string; // Số điện thoại người giám hộ
  address?: string; // Địa chỉ cư trú
  createdAt: string; // Ngày tạo bản ghi (ISO string)
};
