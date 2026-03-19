import { studentsApi } from '@/infrastructure/services/students.api';
import { mapStudentListDtoToModels } from '@/application/students/mappers/students.mapper';
import type { ListStudentsQueryDto } from '@/application/students/dto/student.dto';
import type { StudentModel } from '@/domain/students/models/student.model';

export type ListStudentsResult = {
  items: StudentModel[];
  total: number;
  limit: number;
  offset: number;
};

/**
 * UseCase: Lấy danh sách học viên
 * 1. Gọi API lấy danh sách học viên raw
 * 2. Map data từ DTO sang Model nội bộ
 * 3. Trả về kết quả đã map cùng meta phân trang
 */
export const listStudentsUseCase = async (params?: ListStudentsQueryDto): Promise<ListStudentsResult> => {
  const result = await studentsApi.listStudents(params);
  
  // Dữ liệu giả lập structure { items, total, limit, offset }
  const data = result.data;

  return {
    items: mapStudentListDtoToModels(data.items),
    total: data.total,
    limit: data.limit,
    offset: data.offset,
  };
};
