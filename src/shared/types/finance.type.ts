export type PaymentMethodCode = 'cash' | 'transfer' | 'bank_transfer' | 'other' | string;

export interface ReceiptRow {
  id: string;
  receiptCode: string;
  payerName: string;
  payerAddress?: string;
  studentId: string;
  /** Hiển thị cột học viên (nếu BE trả) */
  studentName?: string;
  enrollmentId: string;
  reason: string;
  amount: number;
  amountInWords?: string;
  paymentMethod: PaymentMethodCode;
  paymentDate?: string;
  createdBy: string;
  payerSignatureName?: string;
  note?: string;
  voidedByReceiptId?: string;
  createdAt?: string;
}

export interface DebtSummary {
  enrollmentId: string;
  tuitionFee: number;
  totalPaid: number;
  totalRefunded: number;
  debt: number;
  receipts?: ReceiptRow[];
}

export interface PaymentStatusRow {
  enrollmentId: string;
  studentId: string;
  studentName: string;
  parentPhone?: string;
  classId: string;
  classCode?: string;
  programCode: string;
  enrollmentStatus: string;
  tuitionFee: number;
  totalPaid: number;
  debt: number;
}

export interface DashboardDebtorRow {
  studentId: string;
  studentName: string;
  debt: number;
}

export interface FinanceDashboardData {
  period: string;
  cashBasis: number;
  accrualBasis: number;
  /** % so với kỳ trước (tuỳ BE) */
  cashTrendPercent?: number | null;
  /** Tổng công nợ toàn hệ thống (tuỳ BE) */
  totalDebt?: number | null;
  /** Số phiếu thu trong kỳ */
  receiptCount?: number | null;
  newEnrollments: number;
  completions: number;
  drops: number;
  byProgram: {
    programCode: string;
    programName?: string;
    cashBasis: number;
    accrual: number;
    enrollments: number;
  }[];
  /** Top nợ */
  topDebtors?: DashboardDebtorRow[];
  /** Số yêu cầu hoàn phí chờ */
  pendingRefundCount?: number | null;
  /** Số yêu cầu bảo lưu chờ */
  pendingPauseCount?: number | null;
}

export interface PayrollListRow {
  id: string;
  payrollCode: string;
  teacherId: string;
  periodMonth: number;
  periodYear: number;
  sessionsCount: number;
  salaryPerSessionSnapshot: number;
  allowanceSnapshot: number;
  totalSalary: number;
  finalizedBy: string;
  finalizedAt?: string;
}

export interface PayrollSessionPreviewRow {
  sessionId: string;
  sessionDate: string;
  classCode: string;
  effectiveTeacherId: string;
  wasCover: boolean;
}

export interface PayrollPreviewData {
  teacherId: string;
  period: string;
  sessionsCount: number;
  sessionsAsMain: PayrollSessionPreviewRow[];
  sessionsAsCover: PayrollSessionPreviewRow[];
  sessionsCovered: PayrollSessionPreviewRow[];
  salaryPerSession: number;
  allowance: number;
  totalSalary: number;
  alreadyFinalized: boolean;
  /** Khi đã chốt — link tới chi tiết bảng lương */
  finalizedPayrollId?: string;
}

export interface PayrollDetailData {
  payroll: PayrollListRow;
  details: {
    id: string;
    payrollId: string;
    sessionId: string;
    sessionDate: string;
    classCode: string;
    wasCover: boolean;
  }[];
}

export interface RefundRequestRow {
  id: string;
  requestCode: string;
  studentName?: string;
  enrollmentId: string;
  reasonType: string;
  reasonDetail: string;
  refundAmount: number;
  status: string;
  reviewedBy?: string;
  reviewNote?: string;
  createdAt?: string;
  updatedAt?: string;
}
