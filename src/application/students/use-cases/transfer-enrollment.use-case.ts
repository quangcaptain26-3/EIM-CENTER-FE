import { enrollmentsApi } from '@/infrastructure/services/enrollments.api';
import { mapEnrollmentDtoToModel } from '@/application/students/mappers/students.mapper';
import type { TransferEnrollmentRequestDto } from '@/application/students/dto/enrollment.dto';
import type { EnrollmentModel } from '@/domain/students/models/enrollment.model';

/**
 * UseCase: Chuyển lớp (transfer)
 * 1. Gọi API chuyển học viên qua lớp mới
 * 2. Xử lý map data dựa theo phản hồi.
 * Lưu ý: Backend có thể trả về Enrollment mới (kết thúc ở lớp cũ, tạo mới ở lớp đích).
 */
export const transferEnrollmentUseCase = async (
  enrollmentId: string, 
  payload: TransferEnrollmentRequestDto
): Promise<EnrollmentModel> => {
  const result = await enrollmentsApi.transferEnrollment(enrollmentId, payload);
  
  // Trả về bản ghi ghi danh (có thể là đối tượng enrollment mới)
  return mapEnrollmentDtoToModel(result.data);
};
