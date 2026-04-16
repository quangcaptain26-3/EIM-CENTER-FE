import { apiClient } from '@/app/config/axios';
import type {
  DashboardData,
  DebtResponse,
  PagedResponse,
  PayrollPreview,
  PayrollRecord,
  PayrollRecordDetail,
  PaymentStatusItem,
  ReceiptResponse,
  RefundRequest,
} from '@/shared/types/api-contract';
import { unwrapApiData } from '@/infrastructure/services/api-unwrap.util';
import { compactParams } from '@/infrastructure/services/query-params.util';

export interface ReceiptsListParams {
  page?: number;
  limit?: number;
  studentId?: string;
  enrollmentId?: string;
  fromDate?: string;
  toDate?: string;
  /** Alias thường dùng ở filter UI */
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  paymentMethod?: string;
}

export async function getReceipts(params?: ReceiptsListParams): Promise<PagedResponse<ReceiptResponse>> {
  const res = await apiClient.get('/receipts', {
    params: params ? compactParams(params as Record<string, unknown>) : undefined,
  });
  return unwrapApiData<PagedResponse<ReceiptResponse>>(res);
}

export async function createReceipt(data: Record<string, unknown>): Promise<ReceiptResponse> {
  const body = { ...data };
  delete body.amount_in_words;
  delete body.amountInWords;
  const res = await apiClient.post('/receipts', body);
  return unwrapApiData<ReceiptResponse>(res);
}

export async function getReceipt(id: string): Promise<ReceiptResponse> {
  const res = await apiClient.get(`/receipts/${id}`);
  return unwrapApiData<ReceiptResponse>(res);
}

export async function voidReceipt(
  id: string,
  body?: Record<string, unknown>,
): Promise<ReceiptResponse> {
  const res = await apiClient.post(`/receipts/${id}/void`, body ?? {});
  return unwrapApiData<ReceiptResponse>(res);
}

export async function getDebt(enrollmentId: string): Promise<DebtResponse> {
  const res = await apiClient.get(`/enrollments/${enrollmentId}/debt`);
  return unwrapApiData<DebtResponse>(res);
}

export interface PaymentStatusListParams {
  page?: number;
  limit?: number;
  search?: string;
  programCode?: string;
  classId?: string;
  minDebt?: number;
}

export async function getPaymentStatus(
  params?: PaymentStatusListParams,
): Promise<PagedResponse<PaymentStatusItem>> {
  const res = await apiClient.get('/finance/payment-status', {
    params: params ? compactParams(params as Record<string, unknown>) : undefined,
  });
  return unwrapApiData<PagedResponse<PaymentStatusItem>>(res);
}

export interface FinanceDashboardParams {
  month?: number;
  year: number;
  quarter?: number;
  yearFrom?: number;
  yearTo?: number;
}

export async function getDashboard(
  params: FinanceDashboardParams | Record<string, unknown>,
): Promise<DashboardData> {
  const res = await apiClient.get('/finance/dashboard', {
    params: compactParams(params as Record<string, unknown>),
  });
  return unwrapApiData<DashboardData>(res);
}

export interface PayrollPreviewParams {
  teacherId: string;
  month: number;
  year: number;
}

export async function previewPayroll(params: PayrollPreviewParams): Promise<PayrollPreview> {
  const res = await apiClient.get('/payroll/preview', {
    params: compactParams(params as unknown as Record<string, unknown>),
  });
  return unwrapApiData<PayrollPreview>(res);
}

export interface FinalizePayrollBody {
  teacherId: string;
  month: number;
  year: number;
}

export async function finalizePayroll(data: FinalizePayrollBody): Promise<PayrollRecord> {
  const res = await apiClient.post('/payroll/finalize', data);
  return unwrapApiData<PayrollRecord>(res);
}

export interface PayrollsListParams {
  page?: number;
  limit?: number;
  teacherId?: string;
  month?: number;
  year?: number;
}

export async function getPayrolls(params?: PayrollsListParams): Promise<PagedResponse<PayrollRecord>> {
  const res = await apiClient.get('/payroll', {
    params: params ? compactParams(params as Record<string, unknown>) : undefined,
  });
  return unwrapApiData<PagedResponse<PayrollRecord>>(res);
}

export async function getPayroll(id: string): Promise<PayrollRecordDetail> {
  const res = await apiClient.get(`/payroll/${id}`);
  return unwrapApiData<PayrollRecordDetail>(res);
}

export interface RefundRequestsListParams {
  page?: number;
  limit?: number;
  status?: string;
}

export async function getRefundRequests(
  params?: RefundRequestsListParams,
): Promise<PagedResponse<RefundRequest>> {
  const res = await apiClient.get('/refund-requests', {
    params: params ? compactParams(params as Record<string, unknown>) : undefined,
  });
  return unwrapApiData<PagedResponse<RefundRequest>>(res);
}

export async function createRefundRequest(data: Record<string, unknown>): Promise<RefundRequest> {
  const res = await apiClient.post('/refund-requests', data);
  return unwrapApiData<RefundRequest>(res);
}

export async function approveRefund(id: string, note?: string): Promise<void> {
  await apiClient.patch(`/refund-requests/${id}/approve`, note !== undefined ? { note } : {});
}

export async function rejectRefund(id: string, reviewNote: string): Promise<void> {
  await apiClient.patch(`/refund-requests/${id}/reject`, { reviewNote });
}

export interface ExportJobStatusResponse {
  jobId: string;
  status: 'processing' | 'done' | 'failed' | string;
  downloadUrl?: string;
  error?: string;
}

/** Trạng thái job xuất file lớn — GET /export/jobs/:jobId */
export async function getExportJob(jobId: string): Promise<ExportJobStatusResponse> {
  const res = await apiClient.get(`/export/jobs/${jobId}`);
  return unwrapApiData<ExportJobStatusResponse>(res);
}

/**
 * Tải báo cáo công nợ — GET /export/debt.
 * File trả ngay khi `Content-Disposition` / body là file; nếu JSON `{ jobId, status: 'processing' }` thì poll rồi tải.
 */
export async function exportDebtReport(
  params?: Record<string, unknown>,
  options?: {
    onJobStarted?: (jobId: string) => void;
    pollIntervalMs?: number;
  },
): Promise<Blob> {
  const res = await apiClient.get<ArrayBuffer>('/export/debt', {
    params: params ? compactParams(params as Record<string, unknown>) : undefined,
    responseType: 'arraybuffer',
  });
  const ct = String(res.headers['content-type'] ?? '');
  const buf = res.data;
  if (ct.includes('application/json')) {
    const json = JSON.parse(new TextDecoder().decode(buf)) as {
      jobId?: string;
      status?: string;
      downloadUrl?: string;
      error?: string;
    };
    if (json.jobId && json.status === 'processing') {
      options?.onJobStarted?.(json.jobId);
      const interval = options?.pollIntervalMs ?? 2000;
      const maxAttempts = 90;
      for (let i = 0; i < maxAttempts; i++) {
        await new Promise((r) => setTimeout(r, interval));
        const st = await getExportJob(json.jobId);
        if (st.status === 'done' && st.downloadUrl) {
          const fileRes = await apiClient.get<ArrayBuffer>(st.downloadUrl, { responseType: 'arraybuffer' });
          return new Blob([fileRes.data]);
        }
        if (st.status === 'failed') {
          throw new Error(st.error ?? 'Export thất bại');
        }
      }
      throw new Error('Hết thời gian chờ xuất file');
    }
  }
  return new Blob([buf], { type: ct || undefined });
}
