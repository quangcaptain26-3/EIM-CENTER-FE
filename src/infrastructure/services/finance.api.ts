/**
 * @file finance.api.ts
 * @description Service gọi API cho các nghiệp vụ tài chính (Finance).
 */

import { apiClient } from "@/app/config/axios";
import type { ApiSuccessResponse } from "@/shared/types/api.type";
import type {
  CreateFeePlanDto,
  UpdateFeePlanDto,
  CreateInvoiceDto,
  UpdateInvoiceStatusDto,
  CreatePaymentDto,
  ListInvoicesParams,
  ExportPaymentsParams,
} from "@/application/finance/dto/finance.dto";
import type { RawStudentFinance } from "@/application/finance/mappers/finance.mapper";

export const financeApi = {
  /**
   * Lấy danh sách gói học phí
   * GET /finance/fee-plans
   */
  async listFeePlans(params?: { programId?: string }): Promise<ApiSuccessResponse<any[]>> {
    const response = await apiClient.get<ApiSuccessResponse<any[]>>("/finance/fee-plans", { params });
    return response.data;
  },

  /**
   * Tạo gói học phí mới
   * POST /finance/fee-plans
   */
  async createFeePlan(payload: CreateFeePlanDto): Promise<ApiSuccessResponse<any>> {
    const response = await apiClient.post<ApiSuccessResponse<any>>("/finance/fee-plans", payload);
    return response.data;
  },

  /**
   * Cập nhật gói học phí
   * PATCH /finance/fee-plans/:id
   */
  async updateFeePlan(id: string, payload: UpdateFeePlanDto): Promise<ApiSuccessResponse<any>> {
    const response = await apiClient.patch<ApiSuccessResponse<any>>(`/finance/fee-plans/${id}`, payload);
    return response.data;
  },

  /**
   * Lấy danh sách hóa đơn (có filter)
   * GET /finance/invoices
   */
  async listInvoices(params?: ListInvoicesParams): Promise<ApiSuccessResponse<any[]>> {
    const response = await apiClient.get<ApiSuccessResponse<any[]>>("/finance/invoices", { params });
    return response.data;
  },

  /**
   * Lấy chi tiết hóa đơn kèm lịch sử thanh toán
   * GET /finance/invoices/:id
   */
  async getInvoice(id: string): Promise<ApiSuccessResponse<any>> {
    const response = await apiClient.get<ApiSuccessResponse<any>>(`/finance/invoices/${id}`);
    return response.data;
  },

  /**
   * Tạo hóa đơn mới
   * POST /finance/invoices
   */
  async createInvoice(payload: CreateInvoiceDto): Promise<ApiSuccessResponse<any>> {
    const response = await apiClient.post<ApiSuccessResponse<any>>("/finance/invoices", payload);
    return response.data;
  },

  /**
   * Cập nhật trạng thái hóa đơn
   * PATCH /finance/invoices/:id/status
   */
  async updateInvoiceStatus(id: string, payload: UpdateInvoiceStatusDto): Promise<ApiSuccessResponse<any>> {
    const response = await apiClient.patch<ApiSuccessResponse<any>>(`/finance/invoices/${id}/status`, payload);
    return response.data;
  },

  /**
   * Ghi nhận thanh toán
   * POST /finance/payments
   */
  async createPayment(payload: CreatePaymentDto): Promise<ApiSuccessResponse<any>> {
    const response = await apiClient.post<ApiSuccessResponse<any>>("/finance/payments", payload);
    return response.data;
  },

  /**
   * Lấy tóm tắt tài chính của một học học viên
   * GET /students/:id/finance
   */
  async getStudentFinance(studentId: string): Promise<ApiSuccessResponse<RawStudentFinance>> {
    const response = await apiClient.get<ApiSuccessResponse<RawStudentFinance>>(`/students/${studentId}/finance`);
    return response.data;
  },

  /**
   * Xuất danh sách hóa đơn ra file Excel.
   * Route BE: GET /finance/invoices/export
   * Params: status?, overdue?, fromDate?, toDate? (đều optional)
   *
   * Edge case "không có data": BE vẫn trả file hợp lệ với sheet "No Data".
   * FE download bình thường, người dùng thấy sheet báo "Không có dữ liệu".
   */
  async exportFinanceExcel(params?: ListInvoicesParams): Promise<void> {
    const { downloadExcelFromApi } = await import('@/shared/lib/excel');
    const filename = `HoaDon_${new Date().toISOString().slice(0, 10)}.xlsx`;
    await downloadExcelFromApi('/finance/invoices/export', (params as Record<string, unknown>) ?? {}, filename);
  },

  /**
   * Danh sách trạng thái thanh toán học sinh (đã đóng/chưa đóng theo enrollment+invoice)
   * GET /finance/student-payment-status
   */
  async listStudentPaymentStatus(params?: {
    paymentStatus?: 'paid' | 'unpaid' | 'partial' | 'overdue' | 'no_invoice';
    classId?: string;
    programId?: string;
    keyword?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiSuccessResponse<{ items: unknown[]; total: number; limit: number; offset: number }>> {
    const response = await apiClient.get<ApiSuccessResponse<{ items: unknown[]; total: number; limit: number; offset: number }>>(
      '/finance/student-payment-status',
      { params }
    );
    return response.data;
  },

  /**
   * Xuất danh sách trạng thái thanh toán học sinh ra Excel
   * GET /finance/student-payment-status/export
   */
  async exportStudentPaymentStatusExcel(params?: {
    paymentStatus?: 'paid' | 'unpaid' | 'partial' | 'overdue' | 'no_invoice';
    classId?: string;
    programId?: string;
    keyword?: string;
  }): Promise<void> {
    const { downloadExcelFromApi } = await import('@/shared/lib/excel');
    const filename = `TrangThaiThanhToan_${new Date().toISOString().slice(0, 10)}.xlsx`;
    await downloadExcelFromApi(
      '/finance/student-payment-status/export',
      (params as Record<string, unknown>) ?? {},
      filename
    );
  },

  /**
   * Xuất danh sách thanh toán (payments) ra Excel
   * Route BE: GET /finance/payments/export
   */
  async exportPaymentsExcel(params?: ExportPaymentsParams): Promise<void> {
    const { downloadExcelFromApi } = await import('@/shared/lib/excel');
    const filename = `Payments_${new Date().toISOString().slice(0, 10)}.xlsx`;
    await downloadExcelFromApi(
      '/finance/payments/export',
      (params as Record<string, unknown>) ?? {},
      filename,
    );
  },
};
