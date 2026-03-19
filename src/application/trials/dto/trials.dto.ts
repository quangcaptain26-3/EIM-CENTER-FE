/**
 * DTOs (Data Transfer Objects) cho module Trials ở frontend
 * Định nghĩa các kiểu dữ liệu được gửi lên API
 * Ánh xạ từ Zod schemas trong backend: trial.dto.ts, schedule.dto.ts, convert.dto.ts
 */

import type { TrialStatus } from '@/domain/trials/models/trial-lead.model';

// ===================================================
// DTO TẠO MỚI TRIAL LEAD
// ===================================================

/**
 * Dữ liệu cần thiết để tạo một Trial Lead mới
 * Ánh xạ từ CreateTrialBody ở backend
 */
export type CreateTrialDto = {
  /** Họ và tên khách hàng tiềm năng (bắt buộc) */
  fullName: string;
  /** Số điện thoại liên hệ (bắt buộc, tối thiểu 10 chữ số) */
  phone: string;
  /** Địa chỉ email (tùy chọn) */
  email?: string | null;
  /** Nguồn tiếp cận: Facebook, Zalo, Giới thiệu, ... (tùy chọn) */
  source?: string | null;
  /** Ghi chú ban đầu (tùy chọn, tối đa 1000 ký tự) */
  note?: string | null;
};

// ===================================================
// DTO CẬP NHẬT TRIAL LEAD
// ===================================================

/**
 * Dữ liệu dùng để cập nhật thông tin và trạng thái Trial Lead
 * Ánh xạ từ UpdateTrialBody ở backend
 * Tất cả trường đều là tùy chọn (partial update)
 */
export type UpdateTrialDto = {
  /** Cập nhật họ tên */
  fullName?: string;
  /** Cập nhật số điện thoại */
  phone?: string;
  /** Cập nhật email */
  email?: string | null;
  /** Cập nhật nguồn tiếp cận */
  source?: string | null;
  /** Cập nhật trạng thái lead */
  status?: TrialStatus;
  /** Cập nhật ghi chú */
  note?: string | null;
};

// ===================================================
// DTO ĐẶT LỊCH HỌC THỬ
// ===================================================

/**
 * Dữ liệu để đặt hoặc cập nhật lịch học thử cho Trial Lead
 * Ánh xạ từ ScheduleTrialBody ở backend
 */
export type ScheduleTrialDto = {
  /** ID lớp học được chọn để học thử (UUID) */
  classId: string;
  /** Ngày giờ học thử (ISO string hoặc Date, backend sẽ coerce) */
  trialDate: string;
};

// ===================================================
// DTO CHUYỂN ĐỔI TRIAL LEAD SANG HỌC VIÊN
// ===================================================

/**
 * Thông tin học viên mới khi convert từ Trial Lead
 * Ánh xạ từ StudentSchema trong ConvertTrialSchema ở backend
 */
export type NewStudentData = {
  /** Họ và tên học viên (bắt buộc) */
  fullName: string;
  /** Số điện thoại học viên (tùy chọn) */
  phone?: string;
  /** Địa chỉ email (tùy chọn) */
  email?: string | null;
  /** Tên người giám hộ (tùy chọn) */
  guardianName?: string | null;
  /** Số điện thoại người giám hộ (tùy chọn) */
  guardianPhone?: string | null;
  /** Địa chỉ cư trú (tùy chọn) */
  address?: string | null;
  /** Ngày sinh dạng chuỗi YYYY-MM-DD (tùy chọn) */
  dob?: string | null;
  /** Giới tính: MALE | FEMALE | OTHER (tùy chọn) */
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
};

/**
 * Dữ liệu để thực hiện convert Trial Lead thành học viên + enrollment
 * Ánh xạ từ ConvertTrialBody ở backend
 * Backend tạo Student mới từ trường `student` và Enrollment từ `classId`
 */
export type ConvertTrialDto = {
  /** Thông tin học viên mới cần tạo khi convert */
  student: NewStudentData;
  /** ID lớp học để tạo enrollment ngay khi convert (UUID) */
  classId: string;
  /** Ghi chú cho quá trình chuyển đổi (tùy chọn) */
  note?: string | null;
};

// ===================================================
// PARAMS LỌC DANH SÁCH TRIAL LEADS
// ===================================================

/**
 * Tham số query để lấy danh sách Trial Lead có filter và phân trang
 * Ánh xạ từ ListTrialsQuery ở backend
 */
export type TrialListParams = {
  /** Tìm kiếm theo tên hoặc số điện thoại */
  search?: string;
  /** Lọc theo trạng thái cụ thể */
  status?: TrialStatus;
  /** Số lượng items mỗi trang (mặc định 20, tối đa 100) */
  limit?: number;
  /** Vị trí bắt đầu lấy dữ liệu cho phân trang */
  offset?: number;
};

// ===================================================
// PARAMS EXPORT TRIALS
// ===================================================

export type ExportTrialsParams = {
  search?: string;
  status?: TrialStatus;
  limit?: number;
};
