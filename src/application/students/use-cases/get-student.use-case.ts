import { studentsApi } from '@/infrastructure/services/students.api';
import { mapStudentDtoToModel } from '@/application/students/mappers/students.mapper';
import type { StudentModel } from '@/domain/students/models/student.model';

/**
 * UseCase: Lấy chi tiết học viên
 * 1. Gọi API lấy thông tin học viên theo ID
 * 2. Chuyển đổi DTO nhận được thành chuỗi đối tượng Model
 */
export const getStudentUseCase = async (id: string): Promise<StudentModel> => {
  const result = await studentsApi.getStudentById(id);
  
  return mapStudentDtoToModel(result.data);
};
