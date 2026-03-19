import { enrollmentsApi } from '@/infrastructure/services/enrollments.api';
import { mapEnrollmentDtoToModel } from '@/application/students/mappers/students.mapper';
import type { CreateEnrollmentRequestDto } from '@/application/students/dto/enrollment.dto';
import type { EnrollmentModel } from '@/domain/students/models/enrollment.model';

/**
 * UseCase: Tạo ghi danh mới
 * 1. Gọi API thêm học viên vào lớp (Tạo mới bản ghi ghi danh)
 * 2. Map response DTO sang EnrollmentModel trả về
 */
export const createEnrollmentUseCase = async (payload: CreateEnrollmentRequestDto): Promise<EnrollmentModel> => {
  const result = await enrollmentsApi.createEnrollment(payload);
  
  return mapEnrollmentDtoToModel(result.data);
};
