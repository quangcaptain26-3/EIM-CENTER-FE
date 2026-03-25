/**
 * API Service cho module Trials (Học thử / Trial Leads)
 * Tập hợp các hàm gọi tới backend REST API tại /api/v1/trials
 * Tương tác với trialsRouter ở backend (trials.controller.ts)
 */

import { apiClient } from '@/app/config/axios';
import type { ApiSuccessResponse } from '@/shared/types/api.type';
import type { TrialLeadModel } from '@/domain/trials/models/trial-lead.model';
import type {
  CreateTrialDto,
  UpdateTrialDto,
  ScheduleTrialDto,
  ConvertTrialDto,
  TrialListParams,
  ExportTrialsParams,
} from '@/application/trials/dto/trials.dto';
import type { ConvertTrialResult } from '@/domain/trials/models/trial-conversion.model';
import { mapRawToTrialLead } from '@/application/trials/mappers/trials.mapper';
import { downloadExcelFromApi } from '@/shared/lib/excel';

// ===================================================
// KIỂU DỮ LIỆU RESPONSE
// ===================================================

/**
 * Cấu trúc response danh sách Trial Leads từ API
 * Ánh xạ từ ListTrialsUseCase.execute() ở backend:
 * { items: [...], meta: { total, limit, offset } }
 */
export type TrialListResponse = {
  /** Danh sách trial leads đã được map sang TrialLeadModel */
  items: TrialLeadModel[];
  /** Metadata phân trang từ backend */
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
};

/**
 * Kiểu dữ liệu raw một lead từ API (dùng nội bộ trong service)
 */
type RawTrialLead = Parameters<typeof mapRawToTrialLead>[0];

/**
 * Response trả về khi đặt lịch học thử thành công
 * Ánh xạ từ ScheduleTrialUseCase: { lead, schedule }
 */
export type ScheduleTrialResponse = {
  /** Lead đã được cập nhật status sang SCHEDULED */
  lead: TrialLeadModel;
  /** Thông tin lịch vừa được upsert */
  schedule: {
    id: string;
    trialId: string;
    classId: string;
    trialDate: string;
    createdAt: string;
  };
};

// ===================================================
// TRIAL API SERVICE
// ===================================================

/**
 * Tập hợp các hàm gọi API của module Trials
 */
export const trialsApi = {
  /**
   * Lấy danh sách Trial Leads với khả năng filter và phân trang
   * GET /api/v1/trials?status=NEW&search=...&limit=20&offset=0
   * Backend trả về: { items: [...], meta: { total, limit, offset } }
   *
   * @param params - Tham số filter và phân trang (tùy chọn)
   * @returns Danh sách TrialLeadModel đã được map + metadata phân trang
   */
  listTrials: async (params?: TrialListParams): Promise<TrialListResponse> => {
    const serializedParams =
      params && params.statuses && params.statuses.length > 0
        ? { ...params, statuses: params.statuses.join(',') }
        : params;

    const response = await apiClient.get<
      ApiSuccessResponse<{
        items: RawTrialLead[];
        meta: { total: number; limit: number; offset: number };
      }>
    >('/trials', { params: serializedParams });

    const raw = response.data.data;
    return {
      items: raw.items.map(mapRawToTrialLead),
      meta: raw.meta,
    };
  },

  /**
   * Lấy thông tin chi tiết một Trial Lead theo ID
   * GET /api/v1/trials/:id
   * Response bao gồm cả thông tin schedule nếu đã đặt lịch
   *
   * @param id - UUID của trial lead cần lấy
   * @returns TrialLeadModel đầy đủ thông tin (kèm schedule nếu có)
   */
  getTrial: async (id: string): Promise<TrialLeadModel> => {
    const response = await apiClient.get<ApiSuccessResponse<RawTrialLead>>(`/trials/${id}`);
    return mapRawToTrialLead(response.data.data);
  },

  /**
   * Tạo một Trial Lead mới trong hệ thống
   * POST /api/v1/trials
   * Chỉ các role WRITE_ROLES (ROOT, DIRECTOR, SALES) mới được phép
   *
   * @param dto - Dữ liệu trial lead mới (fullName, phone bắt buộc)
   * @returns TrialLeadModel vừa được tạo với status = NEW
   */
  createTrial: async (dto: CreateTrialDto): Promise<TrialLeadModel> => {
    const response = await apiClient.post<ApiSuccessResponse<RawTrialLead>>('/trials', dto);
    return mapRawToTrialLead(response.data.data);
  },

  /**
   * Cập nhật thông tin và/hoặc trạng thái của một Trial Lead
   * PATCH /api/v1/trials/:id
   * Chỉ các role WRITE_ROLES (ROOT, DIRECTOR, SALES) mới được phép
   *
   * @param id - UUID của trial lead cần cập nhật
   * @param dto - Các trường cần cập nhật (tất cả đều optional)
   * @returns TrialLeadModel sau khi cập nhật (kèm schedule nếu có)
   */
  updateTrial: async (id: string, dto: UpdateTrialDto): Promise<TrialLeadModel> => {
    const response = await apiClient.patch<ApiSuccessResponse<RawTrialLead>>(
      `/trials/${id}`,
      dto
    );
    return mapRawToTrialLead(response.data.data);
  },

  /**
   * Đặt hoặc cập nhật lịch học thử cho một Trial Lead
   * POST /api/v1/trials/:id/schedule
   * Backend upsert lịch và tự động cập nhật status lead sang SCHEDULED
   * Chỉ các role PROCESS_ROLES (ROOT, DIRECTOR, ACADEMIC) mới được phép
   *
   * @param id - UUID của trial lead cần đặt lịch
   * @param dto - Thông tin lịch học thử (classId + trialDate)
   * @returns { lead: TrialLeadModel, schedule } sau khi đặt lịch thành công
   */
  scheduleTrial: async (id: string, dto: ScheduleTrialDto): Promise<ScheduleTrialResponse> => {
    const response = await apiClient.post<
      ApiSuccessResponse<{
        lead: RawTrialLead;
        schedule: ScheduleTrialResponse['schedule'];
      }>
    >(`/trials/${id}/schedule`, dto);

    const raw = response.data.data;
    return {
      lead: mapRawToTrialLead(raw.lead),
      schedule: raw.schedule,
    };
  },

  /**
   * Chuyển đổi Trial Lead thành học viên chính thức + enrollment
   * POST /api/v1/trials/:id/convert
   * Backend: tạo Student → tạo Enrollment → cập nhật trial status sang CONVERTED
   * Chỉ các role PROCESS_ROLES mới được phép
   * Rule (ConvertTrialRule): không convert nếu status là CONVERTED hoặc CLOSED
   *
   * @param id - UUID của trial lead cần convert
   * @param dto - Thông tin học viên mới (student object) và classId để ghi danh
   * @returns { message, conversion, studentId, enrollmentId }
   */
  convertTrial: async (id: string, dto: ConvertTrialDto): Promise<ConvertTrialResult> => {
    const response = await apiClient.post<ApiSuccessResponse<ConvertTrialResult>>(
      `/trials/${id}/convert`,
      dto
    );
    return response.data.data;
  },

  /**
   * Xuất danh sách Trial Leads ra Excel
   * GET /api/v1/trials/export
   */
  exportTrialsExcel: async (params?: ExportTrialsParams): Promise<void> => {
    await downloadExcelFromApi('/trials/export', params ?? {}, 'trials.xlsx');
  },
};
