/**
 * Mapper cho module Lớp học (Classes)
 * Chuyển đổi dữ liệu DTO (tầng Application) sang Domain Models để dùng trong toàn bộ frontend.
 */

import type {
  ClassDetailResponseDto,
  ClassResponseDto,
  ClassScheduleResponseDto,
  ClassStaffResponseDto,
} from "../dto/classes.dto";
import type {
  ClassModel,
  ClassScheduleModel,
  ClassStaffModel,
} from "../../../domain/classes/models/class.model";

/**
 * Map một DTO lớp học cơ bản sang Domain Model.
 */
export const mapClassDtoToModel = (dto: ClassResponseDto): ClassModel => {
  return {
    id: dto.id,
    code: dto.code,
    name: dto.name,
    programId: dto.programId,
    programName: dto.programName ?? null,
    room: dto.room,
    capacity: dto.capacity,
    currentSize: dto.currentSize ?? 0,
    remainingCapacity: dto.remainingCapacity ?? (dto.capacity - (dto.currentSize ?? 0)),
    startDate: dto.startDate,
    status: dto.status,
    createdAt: dto.createdAt,
  };
};

/**
 * Map danh sách DTO lớp học sang danh sách Domain Model.
 */
export const mapClassListDtoToModels = (
  items: ClassResponseDto[],
): ClassModel[] => {
  return items.map(mapClassDtoToModel);
};

/**
 * Map DTO lịch học sang Domain Model.
 */
export const mapScheduleDtoToModel = (
  dto: ClassScheduleResponseDto,
): ClassScheduleModel => {
  return {
    id: dto.id,
    classId: dto.classId,
    weekday: dto.weekday,
    startTime: dto.startTime,
    endTime: dto.endTime,
  };
};

/**
 * Map DTO staff sang Domain Model.
 */
export const mapStaffDtoToModel = (
  dto: ClassStaffResponseDto,
): ClassStaffModel => {
  return {
    id: dto.id,
    classId: dto.classId,
    userId: dto.userId,
    type: dto.type,
    assignedAt: dto.assignedAt,
  };
};

/**
 * Map DTO chi tiết lớp học (gồm schedules & staff) sang Domain Model đầy đủ.
 */
export const mapClassDetailDtoToModel = (
  dto: ClassDetailResponseDto,
): ClassModel => {
  return {
    ...mapClassDtoToModel(dto),
    schedules: dto.schedules?.map(mapScheduleDtoToModel),
    staff: dto.staff?.map(mapStaffDtoToModel),
  };
};


