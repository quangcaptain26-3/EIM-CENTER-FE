/**
 * Mapper chuyển đổi dữ liệu từ API response sang TrialLeadModel
 * Xử lý chuẩn hóa kiểu dữ liệu và các trường optional/nullable
 * Ánh xạ từ output của TrialsMapper.toResponse() ở backend
 */

import type { TrialLeadModel, TrialStatus } from '@/domain/trials/models/trial-lead.model';

// ===================================================
// KIỂU DỮ LIỆU RAW TỪ API
// ===================================================

/**
 * Kiểu dữ liệu schedule thô trả về từ API
 */
type RawSchedule = {
  id: string;
  classId: string;
  trialDate: string;
} | null;

/**
 * Kiểu dữ liệu thô một Trial Lead từ API response
 * Phản ánh cấu trúc JSON backend trả về
 */
type RawTrialLead = {
  id: string;
  fullName: string;
  phone: string;
  email?: string | null;
  source?: string | null;
  status: string;
  note?: string | null;
  createdBy?: string | null;
  createdAt: string;
  schedule?: RawSchedule;
};

/**
 * Kiểu dữ liệu response danh sách từ API
 */
type RawTrialListResponse = {
  items: RawTrialLead[];
  total: number;
  limit: number;
  offset: number;
};

// ===================================================
// HÀM MAPPER
// ===================================================

/**
 * Chuyển đổi một đối tượng raw từ API sang TrialLeadModel
 * Đảm bảo trường status được cast đúng kiểu TrialStatus
 *
 * @param raw - Dữ liệu thô từ API response
 * @returns TrialLeadModel đã được chuẩn hóa
 */
export function mapRawToTrialLead(raw: RawTrialLead): TrialLeadModel {
  return {
    id: raw.id,
    fullName: raw.fullName,
    phone: raw.phone,
    email: raw.email ?? null,
    source: raw.source ?? null,
    status: raw.status as TrialStatus,
    note: raw.note ?? null,
    createdBy: raw.createdBy ?? null,
    createdAt: raw.createdAt,
    schedule: raw.schedule
      ? {
          id: raw.schedule.id,
          classId: raw.schedule.classId,
          trialDate: raw.schedule.trialDate,
        }
      : null,
  };
}

/**
 * Chuyển đổi danh sách raw từ API sang mảng TrialLeadModel
 *
 * @param raws - Mảng dữ liệu thô từ API
 * @returns Mảng TrialLeadModel đã được chuẩn hóa
 */
export function mapRawListToTrialLeads(raws: RawTrialLead[]): TrialLeadModel[] {
  return raws.map(mapRawToTrialLead);
}

/**
 * Chuyển đổi response danh sách có phân trang từ API
 *
 * @param raw - Response dạng { items, total, limit, offset }
 * @returns Đối tượng đã chuẩn hóa với danh sách TrialLeadModel
 */
export function mapRawListResponse(raw: RawTrialListResponse): {
  items: TrialLeadModel[];
  total: number;
  limit: number;
  offset: number;
} {
  return {
    items: mapRawListToTrialLeads(raw.items),
    total: raw.total,
    limit: raw.limit,
    offset: raw.offset,
  };
}
