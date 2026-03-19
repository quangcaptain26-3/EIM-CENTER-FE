/**
 * @file fee-plan.model.ts
 * @description Định nghĩa model cho Gói học phí (Fee Plan) trong domain finance.
 */

export interface FeePlanModel {
  id: string;          // UUID của gói học phí
  programId: string;   // ID chương trình học liên kết
  programName?: string; // Tên chương trình học (optional nếu lấy từ join)
  amount: number;      // Số tiền học phí
  currency: string;    // Loại tiền tệ (mặc định VND)
  note?: string;       // Ghi chú về gói học phí
  active: boolean;     // Trạng thái hoạt động
  createdAt: string;   // Ngày tạo
}
