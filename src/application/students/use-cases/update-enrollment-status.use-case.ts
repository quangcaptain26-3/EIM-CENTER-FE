import { enrollmentsApi } from '@/infrastructure/services/enrollments.api';
import { mapEnrollmentDtoToModel } from '@/application/students/mappers/students.mapper';
import type { UpdateEnrollmentStatusRequestDto } from '@/application/students/dto/enrollment.dto';
import type { EnrollmentModel } from '@/domain/students/models/enrollment.model';

/**
 * UseCase: Cập nhật trạng thái ghi danh
 * 1. Gọi API đổi trạng thái (VD: đang học -> bảo lưu, thôi học)
 * 2. Dữ liệu thay đổi sẽ được map từ DTO sang thư viện nội bộ (EnrollmentModel)
 */
export const updateEnrollmentStatusUseCase = async (
  enrollmentId: string, 
  payload: UpdateEnrollmentStatusRequestDto
): Promise<EnrollmentModel> => {
  const result = await enrollmentsApi.updateEnrollmentStatus(enrollmentId, payload);
  
  return mapEnrollmentDtoToModel(result.data);
};
