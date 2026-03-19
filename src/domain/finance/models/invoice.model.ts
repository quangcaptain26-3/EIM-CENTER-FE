/**
 * @file invoice.model.ts
 * @description Định nghĩa model và enum trạng thái cho Hóa đơn (Invoice).
 */

import type { PaymentModel } from "./payment.model";

/**
 * Trạng thái hóa đơn
 * UNPAID: Chưa thanh toán
 * PARTIAL: Thanh toán một phần
 * PAID: Đã thanh toán đầy đủ
 * OVERDUE: Quá hạn thanh toán
 */
export const InvoiceStatus = {
  UNPAID: "UNPAID",
  PARTIAL: "PARTIAL",
  PAID: "PAID",
  OVERDUE: "OVERDUE",
} as const;

export type InvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus];

export interface InvoiceModel {
  id: string;               // UUID của hóa đơn
  enrollmentId: string;     // ID của lần nhập học
  studentName?: string;     // Tên học viên
  programName?: string;     // Tên chương trình học
  amount: number;           // Tổng số tiền cần đóng
  paidAmount: number;       // Số tiền đã đóng
  remainingAmount: number;  // Số tiền còn lại phải đóng
  dueDate: string;          // Hạn chót thanh toán (YYYY-MM-DD)
  /** Ngày đóng (ngày thanh toán gần nhất) */
  lastPaidAt?: string | null;
  status: InvoiceStatus;    // Trạng thái hiện tại
  note?: string;            // Ghi chú
  payments?: PaymentModel[]; // Danh sách các lần thanh toán
  createdAt: string;        // Ngày tạo
  updatedAt?: string;       // Ngày cập nhật cuối
}
