/**
 * @file use-finance-mutations.ts
 * @description Các hooks thực hiện thao tác ghi dữ liệu tài chính (Mutations).
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/infrastructure/query/query-keys';
import { financeApi } from '@/infrastructure/services/finance.api';
import { toastAdapter } from '@/infrastructure/adapters/toast.adapter';
import { mapHttpError } from '@/infrastructure/http/http-error.mapper';
import { formatVND } from '@/shared/lib/currency';
import type {
  CreateFeePlanDto,
  UpdateFeePlanDto,
  CreateInvoiceDto,
  UpdateInvoiceStatusDto,
  CreatePaymentDto,
  ListInvoicesParams,
} from '@/application/finance/dto/finance.dto';

/**
 * Hook tạo mới gói học phí
 */
export const useCreateFeePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateFeePlanDto) => financeApi.createFeePlan(dto),
    onSuccess: () => {
      // Invalidate toàn bộ danh sách gói học phí (bao gồm cả các query có params)
      queryClient.invalidateQueries({ queryKey: ['finance', 'fee-plans'] });
      toastAdapter.success('Đã tạo gói học phí mới thành công');
    },
    onError: (error) => {
      toastAdapter.error(mapHttpError(error));
    },
  });
};

/**
 * Hook cập nhật gói học phí
 */
export const useUpdateFeePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateFeePlanDto }) => 
      financeApi.updateFeePlan(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'fee-plans'] });
      toastAdapter.success('Đã cập nhật gói học phí thành công');
    },
    onError: (error) => {
      toastAdapter.error(mapHttpError(error));
    },
  });
};

/**
 * Hook tạo hóa đơn mới cho một lần nhập học (enrollment)
 */
export const useCreateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateInvoiceDto) => financeApi.createInvoice(dto),
    onSuccess: () => {
      // Invalidate danh sách hóa đơn (tất cả trang và filter)
      queryClient.invalidateQueries({ queryKey: ['finance', 'invoices'] });
      // Invalidate tóm tắt tài chính của học viên liên quan
      // Lưu ý: DTO CreateInvoiceDto có enrollmentId, ta có thể dùng nó để invalidate nếu keys có enrollmentId
      // Ở đây key là studentSummary(studentId), nếu không có studentId ta invalidate all student-summary
      queryClient.invalidateQueries({ queryKey: ['finance', 'student-summary'] });
      
      toastAdapter.success('Đã tạo hóa đơn học phí mới');
    },
    onError: (error) => {
      toastAdapter.error(mapHttpError(error));
    },
  });
};

/**
 * Hook cập nhật trạng thái hóa đơn thủ công (DRAFT -> ISSUED, v.v.)
 */
export const useUpdateInvoiceStatus = (invoiceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpdateInvoiceStatusDto) => financeApi.updateInvoiceStatus(invoiceId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.invoices() });
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.invoiceDetail(invoiceId) });
      toastAdapter.success('Đã cập nhật trạng thái hóa đơn');
    },
    onError: (error) => {
      toastAdapter.error(mapHttpError(error));
    },
  });
};

/**
 * Hook quan trọng: Ghi nhận thanh toán cho một hóa đơn
 */
export const useCreatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreatePaymentDto) => financeApi.createPayment(dto),
    onSuccess: (_, variables) => {
      const { invoiceId, amount } = variables;

      // 1. Invalidate chi tiết hóa đơn (để cập nhật remainingAmount và list payments)
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.invoiceDetail(invoiceId) });
      
      // 2. Invalidate danh sách hóa đơn (để cập nhật status từ UNPAID -> PARTIAL/PAID trong bảng)
      queryClient.invalidateQueries({ queryKey: ['finance', 'invoices'] });
      
      // 3. Invalidate tóm tắt tài chính học viên
      queryClient.invalidateQueries({ queryKey: ['finance', 'student-summary'] });

      toastAdapter.success(`Đã ghi nhận thanh toán ${formatVND(amount)}`);
    },
    onError: (error) => {
      toastAdapter.error(mapHttpError(error));
    },
  });
};

/**
 * Hook thực hiện xuất dữ liệu tài chính ra file Excel
 */
export const useExportFinanceExcel = () => {
  return useMutation({
    mutationFn: (params?: ListInvoicesParams) => financeApi.exportFinanceExcel(params),
    onMutate: () => {
      toastAdapter.info('Bắt đầu xuất báo cáo hóa đơn theo due date...');
    },
    onSuccess: () => {
      toastAdapter.success('Đã hoàn tất xử lý và bắt đầu tải file Excel.');
    },
    onError: () => {
      toastAdapter.error('Xuất file thất bại — vui lòng thử lại');
    },
  });
};
