/**
 * DTO cho module Lớp học (Classes)
 * Mô tả shape dữ liệu request/response đúng với backend NodeJS (controller + use case).
 */

import type {
  ClassStatus,
  StaffType,
} from "../../../domain/classes/models/class.model";

/**
 * Query params khi lấy danh sách lớp học
 * Khớp với `ListClassesQuery` ở backend.
 */
export interface ListClassesQueryDto {
  search?: string;
  programId?: string;
  status?: ClassStatus;
  limit?: number;
  offset?: number;
}

/**
 * DTO lớp học cơ bản từ backend (dùng cho list, create, update)
 * Khớp với `ClassMapper.toResponse`.
 */
export interface ClassResponseDto {
  id: string;
  code: string;
  name: string;
  programId: string;
  /** Tên chương trình (join từ curriculum_programs) */
  programName?: string | null;
  room: string | null;
  capacity: number;
  /** Sĩ số hiện tại (đếm enrollments ACTIVE) */
  currentSize?: number;
  /** Số chỗ còn trống = capacity - currentSize (tìm lớp còn chỗ) */
  remainingCapacity?: number;
  startDate: string;
  status: ClassStatus;
  createdAt: string;
}

/**
 * DTO lịch học của lớp
 * Khớp với `ClassMapper.toScheduleResponse`.
 */
export interface ClassScheduleResponseDto {
  id: string;
  classId: string;
  weekday: number;
  startTime: string;
  endTime: string;
}

/**
 * DTO nhân sự phân công cho lớp
 * Khớp với `ClassMapper.toStaffResponse`.
 */
export interface ClassStaffResponseDto {
  id: string;
  classId: string;
  userId: string;
  userFullName?: string | null;
  type: StaffType;
  assignedAt: string;
}

/**
 * DTO cho chi tiết lớp học (detail)
 * Khớp với `ClassMapper.toDetailResponse`.
 */
export interface ClassDetailResponseDto extends ClassResponseDto {
  schedules: ClassScheduleResponseDto[];
  staff: ClassStaffResponseDto[];
}

/**
 * DTO danh sách lớp học có phân trang
 * Khớp với output của `ListClassesUseCase.execute`.
 */
export interface ListClassesResponseDto {
  items: ClassResponseDto[];
  total: number;
  limit?: number;
  offset?: number;
}

/** Một dòng lịch học cố định (class_schedules) — khớp backend createClassBodySchema.schedules */
export interface CreateClassScheduleItemDto {
  weekday: number;
  startTime: string;
  endTime: string;
}

/**
 * Payload tạo lớp học
 * Khớp với `CreateClassBody` ở backend.
 */
export interface CreateClassRequestDto {
  code: string;
  name: string;
  programId: string;
  room?: string;
  capacity?: number;
  startDate: string;
  status?: ClassStatus;
  /** Ít nhất 1 dòng để có thể sinh buổi học theo lịch (khuyến nghị khi tạo lớp mới). */
  schedules?: CreateClassScheduleItemDto[];
  autoGenerateSessions?: boolean;
  generateWeeks?: number;
  generateUntilUnitNo?: number;
}

/**
 * Payload cập nhật lớp học
 * Khớp với `UpdateClassBody` ở backend.
 */
export interface UpdateClassRequestDto {
  name?: string;
  room?: string;
  capacity?: number;
  startDate?: string;
  status?: ClassStatus;
}

/**
 * DTO một dòng trong roster (danh sách học viên của lớp)
 * Khớp với `ClassMapper.toRosterResponse`.
 */
export interface ClassRosterResponseDto {
  studentId: string;
  fullName: string;
  status: string;
}

/**
 * Payload upsert lịch học của lớp
 * Khớp với `UpsertSchedulesBody` ở backend.
 */
export interface UpsertSchedulesRequestDto {
  schedules: Array<{
    weekday: number;
    startTime: string;
    endTime: string;
  }>;
}

/**
 * Payload phân công staff cho lớp
 * Khớp với `AssignStaffBody` ở backend.
 */
export interface AssignStaffRequestDto {
  userId: string;
  type: StaffType;
}


