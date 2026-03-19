import { financeApi } from '@/infrastructure/services/finance.api';
import { mapToInvoiceModel } from '@/application/finance/mappers/finance.mapper';
import type { ListInvoicesParams } from '@/application/finance/dto/finance.dto';
import type { InvoiceModel } from '@/domain/finance/models/invoice.model';
import type { CreateInvoiceDto, UpdateInvoiceStatusDto } from '@/application/finance/dto/finance.dto';

export type ListInvoicesResult = {
  items: InvoiceModel[];
  total: number;
};

/**
 * UseCase: Lấy danh sách hóa đơn
 */
export const listInvoicesUseCase = async (params?: ListInvoicesParams): Promise<ListInvoicesResult> => {
  const response = await financeApi.listInvoices(params);
  // Backend trả về structure { items, total, ... }
  const data = response.data as any; 
  return {
    items: data.items.map(mapToInvoiceModel),
    total: data.total,
  };
};

/**
 * UseCase: Lấy chi tiết hóa đơn
 */
export const getInvoiceUseCase = async (id: string): Promise<InvoiceModel> => {
  const response = await financeApi.getInvoice(id);
  return mapToInvoiceModel(response.data);
};

/**
 * UseCase: Tạo hóa đơn mới
 */
export const createInvoiceUseCase = async (data: CreateInvoiceDto): Promise<InvoiceModel> => {
  const response = await financeApi.createInvoice(data);
  return mapToInvoiceModel(response.data);
};

/**
 * UseCase: Cập nhật trạng thái hóa đơn
 */
export const updateInvoiceStatusUseCase = async (id: string, data: UpdateInvoiceStatusDto): Promise<InvoiceModel> => {
  const response = await financeApi.updateInvoiceStatus(id, data);
  return mapToInvoiceModel(response.data);
};
