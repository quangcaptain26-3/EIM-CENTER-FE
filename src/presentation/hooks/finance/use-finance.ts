/**
 * @file use-finance.ts
 * @description Các hooks truy vấn dữ liệu tài chính (Queries).
 */

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { queryKeys } from '@/infrastructure/query/query-keys';
import {
  listFeePlansUseCase,
  listInvoicesUseCase,
  getInvoiceUseCase,
  getStudentFinanceUseCase,
} from '@/application/finance/use-cases';
import type { ListInvoicesParams } from '@/application/finance/dto/finance.dto';
import { InvoiceStatus } from '@/domain/finance/models/invoice.model';

/**
 * Hook lấy danh sách gói học phí
 */
export const useFeePlans = (params?: { programId?: string }) => {
  return useQuery({
    queryKey: queryKeys.finance.feePlans(params as any),
    queryFn: () => listFeePlansUseCase(params),
  });
};

/**
 * Hook lấy danh sách hóa đơn với các filter
 */
export const useInvoices = (params?: ListInvoicesParams) => {
  return useQuery({
    queryKey: queryKeys.finance.invoices(params as any),
    queryFn: () => listInvoicesUseCase(params),
    placeholderData: keepPreviousData,
  });
};

/**
 * Hook lấy danh sách hóa đơn quá hạn
 */
export const useOverdueInvoices = () => {
  return useQuery({
    queryKey: queryKeys.finance.overdueInvoices,
    queryFn: () => listInvoicesUseCase({ status: InvoiceStatus.OVERDUE }),
    placeholderData: keepPreviousData,
  });
};

/**
 * Hook lấy chi tiết một hóa đơn kèm lịch sử thanh toán
 */
export const useInvoice = (id?: string) => {
  return useQuery({
    queryKey: queryKeys.finance.invoiceDetail(id!),
    queryFn: () => getInvoiceUseCase(id!),
    enabled: !!id,
  });
};

/**
 * Hook lấy danh sách trạng thái thanh toán học sinh (đã đóng/chưa đóng theo enrollment+invoice)
 */
export const useStudentPaymentStatus = (params?: {
  paymentStatus?: 'paid' | 'unpaid' | 'partial' | 'overdue' | 'no_invoice';
  classId?: string;
  programId?: string;
  keyword?: string;
  limit?: number;
  offset?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.finance.studentPaymentStatus(params as Record<string, unknown>),
    queryFn: async () => {
      const res = await import('@/infrastructure/services/finance.api').then((m) =>
        m.financeApi.listStudentPaymentStatus(params)
      );
      const payload = (res as { success: boolean; data: { items: unknown[]; total: number; limit: number; offset: number } }).data;
      return payload;
    },
    placeholderData: keepPreviousData,
  });
};

/**
 * Hook lấy tóm tắt tài chính của một học viên
 */
export const useStudentFinance = (studentId?: string) => {
  return useQuery({
    queryKey: queryKeys.finance.studentFinance(studentId!),
    queryFn: () => getStudentFinanceUseCase(studentId!),
    enabled: !!studentId,
  });
};
