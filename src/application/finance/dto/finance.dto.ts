/**
 * @file finance.dto.ts
 * @description Các Data Transfer Objects (DTO) cho các nghiệp vụ tài chính.
 */

import { InvoiceStatus } from "../../../domain/finance/models/invoice.model";
import type { InvoiceModel } from "../../../domain/finance/models/invoice.model";
import type { PaymentMethod } from "../../../domain/finance/models/payment.model";

/**
 * DTO tạo mới gói học phí
 */
export interface CreateFeePlanDto {
  programId: string;
  name: string;
  amount: number;
  currency?: string;
  sessionsPerWeek?: number;
  note?: string;
}

/**
 * DTO cập nhật gói học phí
 */
export interface UpdateFeePlanDto extends Partial<CreateFeePlanDto> {
  active?: boolean;
}

/**
 * DTO tạo mới hóa đơn
 */
export interface CreateInvoiceDto {
  enrollmentId: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  note?: string;
}

/**
 * DTO cập nhật trạng thái hóa đơn
 */
export interface UpdateInvoiceStatusDto {
  status: InvoiceStatus;
}

/**
 * DTO ghi nhận thanh toán
 */
export interface CreatePaymentDto {
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  paidAt: string; // ISO String or YYYY-MM-DD
  note?: string;
}

/**
 * Tham số lọc danh sách hóa đơn
 */
export interface ListInvoicesParams {
  status?: InvoiceStatus;
  enrollmentId?: string;
  fromDate?: string;   // YYYY-MM-DD
  toDate?: string;     // YYYY-MM-DD
  overdue?: boolean;   // Lọc hóa đơn quá hạn
  // FIX 5 (Renewal-needed):
  // Chưa có semantics + backend filter đúng cho "tái phí" nên không expose param này để tránh UI/BE lệch nhau.
}

/**
 * Params export thanh toán (payments)
 * Route BE: GET /api/v1/finance/payments/export
 */
export interface ExportPaymentsParams {
  fromDate?: string; // YYYY-MM-DD (tính theo paid_at)
  toDate?: string;   // YYYY-MM-DD
  method?: PaymentMethod;
  limit?: number;
}

/**
 * DTO tổng hợp tài chính của một học viên
 */
export interface StudentFinanceDto {
  studentId: string;
  studentName: string;
  totalAmount: number;     // Tổng số tiền hóa đơn
  totalPaidAmount: number;       // Tổng số tiền đã thanh toán
  totalRemainingAmount: number;  // Tổng số tiền còn nợ
  invoices: InvoiceModel[]; // Danh sách hóa đơn chi tiết
}
