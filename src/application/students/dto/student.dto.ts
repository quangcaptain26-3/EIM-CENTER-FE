/**
 * Dữ liệu trả về khi truy vấn một học viên
 */
export type StudentResponseDto = {
  id: string;
  fullName: string;
  dob?: string;
  gender?: string;
  phone?: string;
  email?: string;
  guardianName?: string;
  guardianPhone?: string;
  address?: string;
  createdAt: string;
};

/**
 * Payload để tạo học viên mới
 */
export type CreateStudentRequestDto = {
  fullName: string;
  dob?: string;
  gender?: string;
  phone?: string;
  email?: string;
  guardianName?: string;
  guardianPhone?: string;
  address?: string;
};

/**
 * Payload để cập nhật thông tin học viên
 */
export type UpdateStudentRequestDto = Partial<CreateStudentRequestDto>;

/**
 * Query params để tìm kiếm và lọc danh sách học viên
 */
export type ListStudentsQueryDto = {
  search?: string; // Từ khoá tìm kiếm theo tên, sđt...
  limit?: number;  // Số lượng kết quả mỗi trang
  offset?: number; // Vị trí bắt đầu lấy kết quả
};

// =========================
// Params EXPORT students
// =========================
export type ExportStudentsParams = {
  search?: string;
  limit?: number;
};
