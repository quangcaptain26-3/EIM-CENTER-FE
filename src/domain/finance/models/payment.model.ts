/**
 * @file payment.model.ts
 * @description Định nghĩa model và enum phương thức thanh toán cho Lịch sử thanh toán (Payment).
 */

/**
 * Phương thức thanh toán
 */
export const PaymentMethod = {
  CASH: "CASH",
  TRANSFER: "TRANSFER",
  OTHER: "OTHER",
} as const;

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export interface PaymentModel {
  id: string;             // UUID của thanh toán
  invoiceId: string;      // ID hóa đơn liên kết
  amount: number;         // Số tiền thanh toán lần này
  paidAt: string;         // Thời điểm thanh toán
  method: PaymentMethod;  // Phương thức thực hiện
  recordedBy?: string;    // Người ghi nhận (ID hoặc tên nhân viên)
  note?: string;          // Ghi chú thanh toán
}
