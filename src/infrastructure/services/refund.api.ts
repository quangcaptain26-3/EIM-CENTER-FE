/**
 * Tương thích import cũ — logic nằm ở finance.api.
 */
import {
  approveRefund,
  createRefundRequest,
  getRefundRequests,
  rejectRefund,
} from '@/infrastructure/services/finance.api';
import type { PagedResponse } from '@/shared/types/api-contract';
import type { RefundRequest } from '@/shared/types/api-contract';

export const listRefundRequests = getRefundRequests;

export { createRefundRequest };

export function approveRefundRequest(
  id: string,
  body: { reviewNote: string; approvedAmount?: number },
): Promise<void> {
  return approveRefund(id, body.reviewNote);
}

export function rejectRefundRequest(
  id: string,
  body: { requestId: string; status: 'rejected'; reviewNote: string },
): Promise<void> {
  return rejectRefund(id, body.reviewNote);
}

export type { PagedResponse, RefundRequest };
