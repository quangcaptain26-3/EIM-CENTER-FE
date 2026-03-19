/**
 * Các hook truy vấn dữ liệu Lớp học (Classes)
 * Sử dụng TanStack Query + classesApi và ánh xạ sang Domain Model.
 */

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/infrastructure/query/query-keys";
import { classesApi } from "@/infrastructure/services/classes.api";
import type { ListClassesQueryDto } from "@/application/classes/dto/classes.dto";
import {
  mapClassDetailDtoToModel,
  mapClassListDtoToModels,
} from "@/application/classes/mappers/class.mapper";
import type { ClassModel } from "@/domain/classes/models/class.model";
import type { ClassRosterResponseDto } from "@/application/classes/dto/classes.dto";

/**
 * Hook lấy danh sách lớp học với search/filter theo program/status.
 * Trả về cấu trúc phân trang kèm theo mảng ClassModel.
 */
export const useClasses = (
  filters?: ListClassesQueryDto,
): ReturnType<typeof useQuery<{
  items: ClassModel[];
  total: number;
  limit?: number;
  offset?: number;
}>> => {
  return useQuery({
    queryKey: queryKeys.classes.list((filters ?? {}) as unknown as Record<string, unknown>),
    queryFn: async () => {
      const result = await classesApi.listClasses(filters);
      const { items, total, limit, offset } = result.data;

      return {
        items: mapClassListDtoToModels(items),
        total,
        limit,
        offset,
      };
    },
    placeholderData: keepPreviousData,
  });
};

/**
 * Hook lấy chi tiết 1 lớp học.
 * Trả về ClassModel đã được map từ DTO chi tiết.
 */
export const useClass = (
  classId?: string,
): ReturnType<typeof useQuery<ClassModel>> => {
  return useQuery({
    queryKey: queryKeys.classes.detail(classId ?? ""),
    queryFn: async () => {
      const result = await classesApi.getClass(classId as string);
      return mapClassDetailDtoToModel(result.data);
    },
    enabled: !!classId,
  });
};

/**
 * Hook lấy danh sách học viên (roster) của lớp.
 */
export const useClassRoster = (
  classId?: string,
): ReturnType<typeof useQuery<ClassRosterResponseDto[]>> => {
  return useQuery({
    queryKey: queryKeys.classes.roster(classId ?? ""),
    queryFn: async () => {
      const result = await classesApi.getRoster(classId as string);
      return result.data;
    },
    enabled: !!classId,
  });
};

