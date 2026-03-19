import { studentsApi } from '@/infrastructure/services/students.api';
import { mapStudentDtoToModel } from '@/application/students/mappers/students.mapper';
import type { UpdateStudentRequestDto } from '@/application/students/dto/student.dto';
import type { StudentModel } from '@/domain/students/models/student.model';

/**
 * UseCase: Cập nhật học viên
 * 1. Gửi request cập nhật học viên qua ID
 * 2. Map payload (dto) trả về thành StudentModel
 */
export const updateStudentUseCase = async (id: string, payload: UpdateStudentRequestDto): Promise<StudentModel> => {
  const result = await studentsApi.updateStudent(id, payload);
  
  return mapStudentDtoToModel(result.data);
};
