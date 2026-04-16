import type {
  DebtSummary,
  FinanceDashboardData,
  PaymentStatusRow,
  PayrollDetailData,
  PayrollListRow,
  PayrollPreviewData,
  ReceiptRow,
} from '@/shared/types/finance.type';

/** Bóc lớp `{ data: { data, total, ... } }` từ ApiResponse nếu có; giữ `{ data, total, page }`. */
export function financeRoot(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== 'object') return {};
  const o = raw as Record<string, unknown>;
  const d = o.data;
  if (d && typeof d === 'object' && !Array.isArray(d)) {
    const inner = d as Record<string, unknown>;
    if ('total' in inner || 'page' in inner || Array.isArray(inner.data) || Array.isArray(inner.items)) {
      return inner;
    }
  }
  return o;
}

function unwrapBody(raw: unknown): unknown {
  const root = financeRoot(raw);
  if (Object.keys(root).length === 0) return raw;
  return root;
}

function num(v: unknown, fallback = 0): number {
  if (v == null || v === '') return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function str(v: unknown): string {
  if (v == null) return '';
  return String(v);
}

/** Map receipt từ BE (class entity hoặc snake_case row). */
export function parseReceipt(raw: unknown): ReceiptRow | null {
  const inner = unwrapBody(raw);
  if (!inner || typeof inner !== 'object') return null;
  let o = inner as Record<string, unknown>;
  if (Array.isArray(inner)) return null;
  let id = str(o.id);
  if (!id && o.data && typeof o.data === 'object' && !Array.isArray(o.data)) {
    o = o.data as Record<string, unknown>;
    id = str(o.id);
  }
  if (!id) return null;
  return {
    id,
    receiptCode: str(o.receiptCode ?? o.receipt_code),
    studentName: str(o.studentName ?? o.student_name) || undefined,
    payerName: str(o.payerName ?? o.payer_name),
    payerAddress: str(o.payerAddress ?? o.payer_address) || undefined,
    studentId: str(o.studentId ?? o.student_id),
    enrollmentId: str(o.enrollmentId ?? o.enrollment_id),
    reason: str(o.reason),
    amount: num(o.amount),
    amountInWords: str(o.amountInWords ?? o.amount_in_words) || undefined,
    paymentMethod: str(o.paymentMethod ?? o.payment_method) || 'cash',
    paymentDate: o.paymentDate
      ? String(o.paymentDate)
      : o.payment_date
        ? String(o.payment_date)
        : undefined,
    createdBy: str(o.createdBy ?? o.created_by),
    payerSignatureName: str(o.payerSignatureName ?? o.payer_signature_name) || undefined,
    note: str(o.note) || undefined,
    voidedByReceiptId: str(o.voidedByReceiptId ?? o.voided_by_receipt_id) || undefined,
    createdAt: o.createdAt ? String(o.createdAt) : o.created_at ? String(o.created_at) : undefined,
  };
}

export function parseReceiptListResponse(raw: unknown): {
  items: ReceiptRow[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
} {
  const o = financeRoot(raw);
  if (!o || typeof o !== 'object') {
    return { items: [], total: 0, page: 1, limit: 20 };
  }
  const data = o.data ?? o.items;
  const arr = Array.isArray(data) ? data : [];
  const items = arr.map(parseReceipt).filter(Boolean) as ReceiptRow[];
  return {
    items,
    total: num(o.total, items.length),
    page: num(o.page, 1) || 1,
    limit: num(o.limit, 20) || 20,
    totalPages: num(o.totalPages ?? o.total_pages, 0) || undefined,
  };
}

export function parseDebtSummary(raw: unknown): DebtSummary | null {
  const inner = unwrapBody(raw);
  if (!inner || typeof inner !== 'object' || Array.isArray(inner)) return null;
  const o = inner as Record<string, unknown>;
  return {
    enrollmentId: str(o.enrollmentId ?? o.enrollment_id),
    tuitionFee: num(o.tuitionFee ?? o.tuition_fee),
    totalPaid: num(o.totalPaid ?? o.total_paid),
    totalRefunded: num(o.totalRefunded ?? o.total_refunded),
    debt: num(o.debt),
    receipts: Array.isArray(o.receipts)
      ? ((o.receipts as unknown[]).map(parseReceipt).filter((r) => r != null) as ReceiptRow[])
      : undefined,
  };
}

export function parsePaymentStatusListResponse(raw: unknown): {
  items: PaymentStatusRow[];
  total: number;
  page: number;
  limit: number;
} {
  const o = financeRoot(raw);
  if (!o || typeof o !== 'object') {
    return { items: [], total: 0, page: 1, limit: 20 };
  }
  const data = o.data ?? o.items;
  const arr = Array.isArray(data) ? data : [];
  const items: PaymentStatusRow[] = arr.map((row) => {
    const r = row as Record<string, unknown>;
    return {
      enrollmentId: str(r.enrollmentId ?? r.enrollment_id),
      studentId: str(r.studentId ?? r.student_id),
      studentName: str(r.studentName ?? r.student_name),
      parentPhone: str(r.parentPhone ?? r.parent_phone) || undefined,
      classId: str(r.classId ?? r.class_id),
      classCode: str(r.classCode ?? r.class_code) || undefined,
      programCode: str(r.programCode ?? r.program_code),
      enrollmentStatus: str(r.enrollmentStatus ?? r.enrollment_status),
      tuitionFee: num(r.tuitionFee ?? r.tuition_fee),
      totalPaid: num(r.totalPaid ?? r.total_paid),
      debt: num(r.debt),
    };
  });
  return {
    items,
    total: num(o.total, items.length),
    page: num(o.page, 1) || 1,
    limit: num(o.limit, 20) || 20,
  };
}

export function parseFinanceDashboard(raw: unknown): FinanceDashboardData | null {
  const inner = unwrapBody(raw);
  if (!inner || typeof inner !== 'object' || Array.isArray(inner)) return null;
  const o = inner as Record<string, unknown>;
  const byProgramRaw = o.byProgram ?? o.by_program;
  const byProgram = Array.isArray(byProgramRaw)
    ? (byProgramRaw as Record<string, unknown>[]).map((r) => ({
        programCode: str(r.programCode ?? r.program_code),
        programName: str(r.programName ?? r.program_name) || undefined,
        cashBasis: num(r.cashBasis ?? r.cash_basis),
        accrual: num(r.accrual),
        enrollments: num(r.enrollments),
      }))
    : [];
  const topRaw = o.topDebtors ?? o.top_debtors;
  const topDebtors = Array.isArray(topRaw)
    ? (topRaw as Record<string, unknown>[]).map((r) => ({
        studentId: str(r.studentId ?? r.student_id),
        studentName: str(r.studentName ?? r.student_name),
        debt: num(r.debt),
      }))
    : undefined;
  return {
    period: str(o.period),
    cashBasis: num(o.cashBasis ?? o.cash_basis),
    accrualBasis: num(o.accrualBasis ?? o.accrual_basis),
    cashTrendPercent:
      o.cashTrendPercent != null
        ? num(o.cashTrendPercent)
        : o.cash_trend_percent != null
          ? num(o.cash_trend_percent)
          : null,
    totalDebt:
      o.totalDebt != null ? num(o.totalDebt) : o.total_debt != null ? num(o.total_debt) : null,
    receiptCount:
      o.receiptCount != null ? num(o.receiptCount) : o.receipt_count != null ? num(o.receipt_count) : null,
    newEnrollments: num(o.newEnrollments ?? o.new_enrollments),
    completions: num(o.completions),
    drops: num(o.drops),
    byProgram,
    topDebtors,
    pendingRefundCount:
      o.pendingRefundCount != null
        ? num(o.pendingRefundCount)
        : o.pending_refund_count != null
          ? num(o.pending_refund_count)
          : null,
    pendingPauseCount:
      o.pendingPauseCount != null
        ? num(o.pendingPauseCount)
        : o.pending_pause_count != null
          ? num(o.pending_pause_count)
          : null,
  };
}

function parsePayrollEntity(o: Record<string, unknown>): PayrollListRow {
  return {
    id: str(o.id),
    payrollCode: str(o.payrollCode ?? o.payroll_code),
    teacherId: str(o.teacherId ?? o.teacher_id),
    periodMonth: num(o.periodMonth ?? o.period_month, 1),
    periodYear: num(o.periodYear ?? o.period_year),
    sessionsCount: num(o.sessionsCount ?? o.sessions_count),
    salaryPerSessionSnapshot: num(o.salaryPerSessionSnapshot ?? o.salary_per_session_snapshot),
    allowanceSnapshot: num(o.allowanceSnapshot ?? o.allowance_snapshot),
    totalSalary: num(o.totalSalary ?? o.total_salary),
    finalizedBy: str(o.finalizedBy ?? o.finalized_by),
    finalizedAt: o.finalizedAt ? String(o.finalizedAt) : o.finalized_at ? String(o.finalized_at) : undefined,
  };
}

export function parsePayrollListResponse(raw: unknown): {
  items: PayrollListRow[];
  total: number;
  page: number;
  limit: number;
} {
  const o = financeRoot(raw);
  if (!o || typeof o !== 'object') {
    return { items: [], total: 0, page: 1, limit: 20 };
  }
  const data = o.data ?? o.items;
  const arr = Array.isArray(data) ? data : [];
  const items = arr.map((row) => parsePayrollEntity(row as Record<string, unknown>));
  return {
    items,
    total: num(o.total, items.length),
    page: num(o.page, 1) || 1,
    limit: num(o.limit, 20) || 20,
  };
}

export function parsePayrollPreview(raw: unknown): PayrollPreviewData | null {
  const inner = unwrapBody(raw);
  if (!inner || typeof inner !== 'object' || Array.isArray(inner)) return null;
  const o = inner as Record<string, unknown>;
  const mapSession = (row: Record<string, unknown>) => ({
    sessionId: str(row.sessionId ?? row.session_id),
    sessionDate: row.sessionDate ? String(row.sessionDate) : row.session_date ? String(row.session_date) : '',
    classCode: str(row.classCode ?? row.class_code),
    effectiveTeacherId: str(row.effectiveTeacherId ?? row.effective_teacher_id),
    wasCover: Boolean(row.wasCover ?? row.was_cover),
  });
  const main = Array.isArray(o.sessionsAsMain) ? o.sessionsAsMain : o.sessions_as_main;
  const cov = Array.isArray(o.sessionsAsCover) ? o.sessionsAsCover : o.sessions_as_cover;
  const cvd = Array.isArray(o.sessionsCovered) ? o.sessionsCovered : o.sessions_covered;
  const fid = str(o.finalizedPayrollId ?? o.finalized_payroll_id);
  return {
    teacherId: str(o.teacherId ?? o.teacher_id),
    period: str(o.period),
    sessionsCount: num(o.sessionsCount ?? o.sessions_count),
    sessionsAsMain: Array.isArray(main) ? (main as Record<string, unknown>[]).map(mapSession) : [],
    sessionsAsCover: Array.isArray(cov) ? (cov as Record<string, unknown>[]).map(mapSession) : [],
    sessionsCovered: Array.isArray(cvd) ? (cvd as Record<string, unknown>[]).map(mapSession) : [],
    salaryPerSession: num(o.salaryPerSession ?? o.salary_per_session),
    allowance: num(o.allowance),
    totalSalary: num(o.totalSalary ?? o.total_salary),
    alreadyFinalized: Boolean(
      o.alreadyFinalized ?? o.already_finalized ?? o.isFinalized ?? o.is_finalized,
    ),
    finalizedPayrollId: fid || undefined,
  };
}

export function parsePayrollDetail(raw: unknown): PayrollDetailData | null {
  const inner = unwrapBody(raw);
  if (!inner || typeof inner !== 'object' || Array.isArray(inner)) return null;
  const o = inner as Record<string, unknown>;
  const p = o.payroll as Record<string, unknown> | undefined;
  if (!p) return null;
  const detailsRaw = o.details;
  const details = Array.isArray(detailsRaw)
    ? (detailsRaw as Record<string, unknown>[]).map((r) => ({
        id: str(r.id),
        payrollId: str(r.payrollId ?? r.payroll_id),
        sessionId: str(r.sessionId ?? r.session_id),
        sessionDate: r.sessionDate ? String(r.sessionDate) : r.session_date ? String(r.session_date) : '',
        classCode: str(r.classCode ?? r.class_code),
        wasCover: Boolean(r.wasCover ?? r.was_cover),
      }))
    : [];
  return {
    payroll: parsePayrollEntity(p),
    details,
  };
}
