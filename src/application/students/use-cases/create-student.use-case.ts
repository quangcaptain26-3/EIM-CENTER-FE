import { studentsApi } from '@/infrastructure/services/students.api';
import { mapStudentDtoToModel } from '@/application/students/mappers/students.mapper';
import type { CreateStudentRequestDto } from '@/application/students/dto/student.dto';
import type { StudentModel } from '@/domain/students/models/student.model';

/**
 * UseCase: Tạo học viên mới
 * 1. Gửi request tạo học viên lên API
 * 2. Map dữ liệu trả về thành domain model StudentModel
 */
export const createStudentUseCase = async (payload: CreateStudentRequestDto): Promise<StudentModel> => {
  const result = await studentsApi.createStudent(payload);
  
  return mapStudentDtoToModel(result.data);
};
