import { studentsApi } from '@/infrastructure/services/students.api';
import { mapEnrollmentListDtoToModels } from '@/application/students/mappers/students.mapper';
import type { EnrollmentModel } from '@/domain/students/models/enrollment.model';

/**
 * UseCase: Lấy danh sách ghi danh của học viên
 * 1. Fetch danh sách các lịch sử và lớp ghi danh của một sinh viên
 * 2. Map danh sách Enrollment DTOs sang Models Array
 */
export const listStudentEnrollmentsUseCase = async (studentId: string): Promise<EnrollmentModel[]> => {
  const result = await studentsApi.listStudentEnrollments(studentId);
  
  return mapEnrollmentListDtoToModels(result.data);
};
