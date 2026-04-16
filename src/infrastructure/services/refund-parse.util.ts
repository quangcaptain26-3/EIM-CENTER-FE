import type { RefundRequestRow } from '@/shared/types/finance.type';
import { financeRoot } from '@/infrastructure/services/finance-parse.util';

function str(v: unknown): string {
  if (v == null) return '';
  return String(v);
}

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function parseRefundRequest(raw: unknown): RefundRequestRow | null {
  if (!raw || typeof raw !== 'object') return null;
  let o = raw as Record<string, unknown>;
  if (o.data && typeof o.data === 'object' && !Array.isArray(o.data)) {
    const d = o.data as Record<string, unknown>;
    if (d.id != null || d.request_code != null || d.requestCode != null) o = d;
  }
  const id = str(o.id);
  if (!id) return null;
  return {
    id,
    requestCode: str(o.requestCode ?? o.request_code),
    studentName: str(o.studentName ?? o.student_name) || undefined,
    enrollmentId: str(o.enrollmentId ?? o.enrollment_id),
    reasonType: str(o.reasonType ?? o.reason_type),
    reasonDetail: str(o.reasonDetail ?? o.reason_detail),
    refundAmount: num(o.refundAmount ?? o.refund_amount),
    status: str(o.status),
    reviewedBy: str(o.reviewedBy ?? o.reviewed_by) || undefined,
    reviewNote: str(o.reviewNote ?? o.review_note) || undefined,
    createdAt: o.createdAt ? String(o.createdAt) : o.created_at ? String(o.created_at) : undefined,
    updatedAt: o.updatedAt ? String(o.updatedAt) : o.updated_at ? String(o.updated_at) : undefined,
  };
}

export function parseRefundListResponse(raw: unknown): {
  items: RefundRequestRow[];
  total: number;
} {
  const o = financeRoot(raw);
  if (!o || typeof o !== 'object') {
    return { items: [], total: 0 };
  }
  const data = o.data ?? o.items;
  const arr = Array.isArray(data) ? data : [];
  const items = arr.map(parseRefundRequest).filter(Boolean) as RefundRequestRow[];
  return {
    items,
    total: Number(o.total) || items.length,
  };
}
