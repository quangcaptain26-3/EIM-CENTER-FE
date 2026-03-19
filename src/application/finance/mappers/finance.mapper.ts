/**
 * @file finance.mapper.ts
 * @description Mapper để chuyển đổi dữ liệu từ API sang Domain Models.
 */

import type { FeePlanModel } from "../../../domain/finance/models/fee-plan.model";
import { InvoiceStatus } from "../../../domain/finance/models/invoice.model";
import type { InvoiceModel } from "../../../domain/finance/models/invoice.model";
import { PaymentMethod } from "../../../domain/finance/models/payment.model";
import type { PaymentModel } from "../../../domain/finance/models/payment.model";
import type { StudentFinanceDto } from "../dto/finance.dto";

interface RawFeePlan {
  id: string;
  programId: string;
  name: string;
  amount: number;
  currency?: string;
  active?: boolean;
  createdAt: string;
  note?: string;
}

interface RawPayment {
  id: string;
  invoiceId: string;
  amount: number;
  paidAt: string;
  method: string;
  recordedBy?: string;
  note?: string;
  createdAt: string;
}

interface RawInvoice {
  id: string;
  enrollmentId: string;
  studentName?: string;
  programName?: string;
  amount: number;
  status: string;
  dueDate: string;
  lastPaidAt?: string | null;
  paidAmount?: number;
  remainingAmount?: number;
  note?: string;
  payments?: RawPayment[];
  createdAt: string;
  updatedAt?: string;
}

export interface RawStudentFinance {
  studentId: string;
  studentName?: string;
  enrollments: {
    enrollment: any;
    invoices: RawInvoice[];
  }[];
  invoiceSummary: {
    total: number;
    totalAmount: number;
    totalPaidAmount: number;
    totalRemainingAmount: number;
  };
}

/**
 * Map API Response sang FeePlanModel
 */
export function mapToFeePlanModel(data: RawFeePlan): FeePlanModel {
  return {
    id: data.id,
    programId: data.programId,
    programName: data.name, // Giả định backend trả name của gói hoặc join name chương trình
    amount: data.amount,
    currency: data.currency || "VND",
    active: data.active ?? true,
    createdAt: data.createdAt,
    note: data.note,
  };
}

/**
 * Map API Response sang InvoiceModel
 */
export function mapToInvoiceModel(data: RawInvoice): InvoiceModel {
  // Logic xác định trạng thái cho frontend dựa trên dữ liệu thanh toán và trạng thái backend
  let status: InvoiceStatus = InvoiceStatus.UNPAID;
  
  const paidAmount = data.paidAmount || 0;
  const remainingAmount = data.remainingAmount ?? (data.amount - paidAmount);

  if (remainingAmount <= 0 && data.amount > 0) {
    status = InvoiceStatus.PAID;
  } else if (data.status === "OVERDUE") {
    status = InvoiceStatus.OVERDUE;
  } else if (paidAmount > 0) {
    status = InvoiceStatus.PARTIAL;
  } else {
    status = InvoiceStatus.UNPAID;
  }

  return {
    id: data.id,
    enrollmentId: data.enrollmentId,
    studentName: data.studentName,
    programName: data.programName,
    amount: data.amount,
    paidAmount: paidAmount,
    remainingAmount: remainingAmount,
    dueDate: data.dueDate,
    lastPaidAt: data.lastPaidAt ?? null,
    status: status,
    note: data.note,
    payments: data.payments ? data.payments.map(mapToPaymentModel) : [],
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

/**
 * Map API Response sang PaymentModel
 */
export function mapToPaymentModel(data: RawPayment): PaymentModel {
  return {
    id: data.id,
    invoiceId: data.invoiceId,
    amount: data.amount,
    paidAt: data.paidAt,
    method: mapToPaymentMethod(data.method),
    recordedBy: data.recordedBy,
    note: data.note,
  };
}

/**
 * Map API Payment Method sang Enum
 */
function mapToPaymentMethod(method: string): PaymentMethod {
  switch (method) {
    case "CASH": return PaymentMethod.CASH;
    case "TRANSFER": return PaymentMethod.TRANSFER;
    default: return PaymentMethod.OTHER;
  }
}

/**
 * Map API Response sang StudentFinanceDto
 */
export function mapToStudentFinanceModel(data: RawStudentFinance): StudentFinanceDto {
  return {
    studentId: data.studentId,
    studentName: data.studentName || "",
    totalAmount: data.invoiceSummary?.totalAmount || 0,
    totalPaidAmount: data.invoiceSummary?.totalPaidAmount || 0,
    totalRemainingAmount: data.invoiceSummary?.totalRemainingAmount || 0,
    invoices: (data.enrollments || []).flatMap((e) =>
      e.invoices.map(mapToInvoiceModel)
    ),
  };
}
