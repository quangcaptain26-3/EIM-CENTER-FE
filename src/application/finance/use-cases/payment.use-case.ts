import { financeApi } from '@/infrastructure/services/finance.api';
import { mapToPaymentModel, mapToStudentFinanceModel } from '@/application/finance/mappers/finance.mapper';
import type { CreatePaymentDto, StudentFinanceDto } from '@/application/finance/dto/finance.dto';

/**
 * UseCase: Ghi nhận thanh toán
 */
export const createPaymentUseCase = async (data: CreatePaymentDto) => {
  const response = await financeApi.createPayment(data);
  return mapToPaymentModel(response.data);
};

/**
 * UseCase: Lấy tóm tắt tài chính học viên
 */
export const getStudentFinanceUseCase = async (studentId: string): Promise<StudentFinanceDto> => {
  const response = await financeApi.getStudentFinance(studentId);
  return mapToStudentFinanceModel(response.data);
};
