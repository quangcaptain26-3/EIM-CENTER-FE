import { financeApi } from '@/infrastructure/services/finance.api';
import { mapToFeePlanModel } from '@/application/finance/mappers/finance.mapper';
import type { FeePlanModel } from '@/domain/finance/models/fee-plan.model';

/**
 * UseCase: Lấy danh sách gói học phí
 */
export const listFeePlansUseCase = async (params?: { programId?: string }): Promise<FeePlanModel[]> => {
  const response = await financeApi.listFeePlans(params);
  return response.data.map(mapToFeePlanModel);
};

/**
 * UseCase: Tạo gói học phí mới
 */
export const createFeePlanUseCase = async (data: any) => {
  const response = await financeApi.createFeePlan(data);
  return mapToFeePlanModel(response.data);
};

/**
 * UseCase: Cập nhật gói học phí
 */
export const updateFeePlanUseCase = async (id: string, data: any) => {
  const response = await financeApi.updateFeePlan(id, data);
  return mapToFeePlanModel(response.data);
};
