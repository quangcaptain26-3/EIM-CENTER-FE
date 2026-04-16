import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createReceipt, voidReceipt } from '@/infrastructure/services/finance.api';
import { mutationToastApiError } from '@/presentation/hooks/toast-api-error';
import { useFinalizePayroll } from '@/presentation/hooks/finance/use-payroll';
import {
  useApproveRefundRequest,
  useCreateRefundRequest,
  useRejectRefundRequest,
} from '@/presentation/hooks/finance/use-refund-requests';
import { QUERY_KEYS } from '@/infrastructure/query/query-keys';

function useCreateReceiptMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => createReceipt(body),
    onError: mutationToastApiError,
    onSettled: (_d, _e, vars) => {
      const body = vars as Record<string, unknown>;
      const eid = body.enrollmentId as string | undefined;
      const sid = body.studentId as string | undefined;
      void qc.invalidateQueries({ queryKey: ['finance', 'receipts'] });
      void qc.invalidateQueries({ queryKey: ['finance', 'receipt'] });
      void qc.invalidateQueries({ queryKey: ['finance', 'payment-status'] });
      if (eid) {
        void qc.invalidateQueries({ queryKey: QUERY_KEYS.FINANCE.debt(eid) });
      }
      if (sid) {
        void qc.invalidateQueries({ queryKey: QUERY_KEYS.STUDENTS.enrollments(sid) });
        void qc.invalidateQueries({ queryKey: QUERY_KEYS.STUDENTS.detail(sid) });
      }
    },
  });
}

function useVoidReceiptMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body?: { reason?: string; note?: string } }) =>
      voidReceipt(id, body),
    onSuccess: () => {
      toast.success('Đã tạo phiếu bù trừ');
    },
    onError: mutationToastApiError,
    onSettled: (_d, _e, vars) => {
      void qc.invalidateQueries({ queryKey: ['finance', 'receipts'] });
      void qc.invalidateQueries({ queryKey: ['finance', 'receipt'] });
      void qc.invalidateQueries({ queryKey: ['finance', 'debt'] });
      void qc.invalidateQueries({ queryKey: ['finance', 'payment-status'] });
      const rid = vars?.id;
      if (rid) void qc.invalidateQueries({ queryKey: QUERY_KEYS.FINANCE.receipt(rid) });
    },
  });
}

export function useFinanceMutations() {
  return {
    createReceipt: useCreateReceiptMutation(),
    voidReceipt: useVoidReceiptMutation(),
    finalizePayroll: useFinalizePayroll(),
    approveRefund: useApproveRefundRequest(),
    rejectRefund: useRejectRefundRequest(),
    createRefundRequest: useCreateRefundRequest(),
  };
}

export const useCreateReceipt = useCreateReceiptMutation;
export const useVoidReceipt = useVoidReceiptMutation;
