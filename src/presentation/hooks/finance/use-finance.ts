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
 * Hook lấy tóm tắt tài chính của một học viên
 */
export const useStudentFinance = (studentId?: string) => {
  return useQuery({
    queryKey: queryKeys.finance.studentFinance(studentId!),
    queryFn: () => getStudentFinanceUseCase(studentId!),
    enabled: !!studentId,
  });
};
