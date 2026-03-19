import type { StudentResponseDto } from '../dto/student.dto';
import type { EnrollmentResponseDto, EnrollmentHistoryResponseDto } from '../dto/enrollment.dto';
import type { StudentModel } from '@/domain/students/models/student.model';
import type { EnrollmentModel } from '@/domain/students/models/enrollment.model';
import type { EnrollmentHistoryModel } from '@/domain/students/models/enrollment-history.model';

/**
 * Chuyển đổi từ DTO sang Model cho Student
 */
export const mapStudentDtoToModel = (dto: StudentResponseDto): StudentModel => {
  return {
    id: dto.id,
    fullName: dto.fullName,
    dob: dto.dob,
    gender: dto.gender,
    phone: dto.phone,
    email: dto.email,
    guardianName: dto.guardianName,
    guardianPhone: dto.guardianPhone,
    address: dto.address,
    createdAt: dto.createdAt,
  };
};

/**
 * Chuyển đổi danh sách Student DTO sang danh sách Models
 */
export const mapStudentListDtoToModels = (dtos: StudentResponseDto[]): StudentModel[] => {
  return dtos.map(mapStudentDtoToModel);
};

/**
 * Chuyển đổi từ DTO sang Model cho Enrollment
 */
export const mapEnrollmentDtoToModel = (dto: EnrollmentResponseDto): EnrollmentModel => {
  return {
    id: dto.id,
    studentId: dto.studentId,
    classId: dto.classId,
    status: dto.status,
    startDate: dto.startDate,
    endDate: dto.endDate,
    createdAt: dto.createdAt,
  };
};

/**
 * Chuyển đổi danh sách Enrollment DTO sang danh sách Models
 */
export const mapEnrollmentListDtoToModels = (dtos: EnrollmentResponseDto[]): EnrollmentModel[] => {
  return dtos.map(mapEnrollmentDtoToModel);
};

/**
 * Chuyển đổi từ DTO sang Model cho Enrollment History
 */
export const mapEnrollmentHistoryDtoToModel = (dto: EnrollmentHistoryResponseDto): EnrollmentHistoryModel => {
  return {
    id: dto.id,
    enrollmentId: dto.enrollmentId,
    fromStatus: dto.fromStatus,
    toStatus: dto.toStatus,
    note: dto.note,
    changedAt: dto.changedAt,
  };
};
