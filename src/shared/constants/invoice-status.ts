/**
 * @file invoice-status.ts
 * @description Các hằng số và cấu hình hiển thị cho trạng thái hóa đơn.
 */

import { InvoiceStatus } from "@/domain/finance/models/invoice.model";
import type { StatusVariant } from "@/presentation/components/common/status-badge";

/**
 * Nhãn tiếng Việt cho các trạng thái hóa đơn
 */
export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  [InvoiceStatus.UNPAID]: "Chưa thanh toán",
  [InvoiceStatus.PARTIAL]: "Thanh toán một phần",
  [InvoiceStatus.PAID]: "Đã thanh toán",
  [InvoiceStatus.OVERDUE]: "Quá hạn",
};

/**
 * Màu sắc tương ứng cho từng trạng thái hóa đơn
 */
export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, StatusVariant> = {
  [InvoiceStatus.UNPAID]: "inactive",  // Màu xám
  [InvoiceStatus.PARTIAL]: "pending",   // Màu vàng/cam
  [InvoiceStatus.PAID]: "active",       // Màu xanh lá
  [InvoiceStatus.OVERDUE]: "error",     // Màu đỏ
};
