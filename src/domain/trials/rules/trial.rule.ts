/**
 * Business rules cho domain Trial Lead ở frontend
 * Ánh xạ logic từ ConvertTrialRule ở backend và domain rules nghiệp vụ
 * Dùng để kiểm tra điều kiện trước khi thực hiện thao tác UI
 */

import type { TrialLeadModel, TrialStatus } from '@/domain/trials/models/trial-lead.model';

// ===================================================
// CÁC TRẠNG THÁI CHO PHÉP THỰC HIỆN CONVERT
// ===================================================

/**
 * Danh sách trạng thái được phép thực hiện convert sang học viên
 * Theo ConvertTrialRule.isConvertible(): chặn CONVERTED và CLOSED
 */
const CONVERTIBLE_STATUSES: TrialStatus[] = [
  'NEW',
  'CONTACTED',
  'SCHEDULED',
  'ATTENDED',
  'NO_SHOW',
];

/**
 * Danh sách trạng thái không được phép chỉnh sửa thông tin lead
 * Lead đã CONVERTED hoặc CLOSED không nên bị chỉnh sửa
 */
const NON_EDITABLE_STATUSES: TrialStatus[] = ['CONVERTED', 'CLOSED'];

// ===================================================
// BUSINESS RULES
// ===================================================

/**
 * Kiểm tra xem một Trial Lead có thể được convert sang học viên hay không
 * Quy tắc: Không convert nếu đã là CONVERTED hoặc CLOSED
 *
 * @param status - Trạng thái hiện tại của trial lead
 * @returns true nếu có thể convert, false nếu không
 */
export function canConvert(status: TrialStatus): boolean {
  return CONVERTIBLE_STATUSES.includes(status);
}

/**
 * Kiểm tra xem một Trial Lead đã được convert sang học viên chưa
 * Dựa trên trạng thái CONVERTED (đồng bộ với backend entity)
 *
 * @param trial - Đối tượng TrialLeadModel cần kiểm tra
 * @returns true nếu trial lead đã được convert
 */
export function isConverted(trial: TrialLeadModel): boolean {
  return trial.status === 'CONVERTED';
}

/**
 * Kiểm tra xem Trial Lead có thể chỉnh sửa thông tin hay không
 * Các trial lead đã CONVERTED hoặc CLOSED không được sửa
 *
 * @param status - Trạng thái hiện tại của trial lead
 * @returns true nếu có thể chỉnh sửa, false nếu bị khóa
 */
export function canEdit(status: TrialStatus): boolean {
  return !NON_EDITABLE_STATUSES.includes(status);
}

/**
 * Kiểm tra xem Trial Lead có thể đặt lịch học thử hay không
 * Chỉ cho phép đặt lịch khi chưa bị đóng hoặc convert
 *
 * @param status - Trạng thái hiện tại của trial lead
 * @returns true nếu có thể đặt lịch
 */
export function canSchedule(status: TrialStatus): boolean {
  return !NON_EDITABLE_STATUSES.includes(status);
}

/**
 * Kiểm tra xem Trial Lead đã có lịch học thử hay chưa
 *
 * @param trial - Đối tượng TrialLeadModel cần kiểm tra
 * @returns true nếu đã có lịch được đặt
 */
export function hasSchedule(trial: TrialLeadModel): boolean {
  return trial.schedule != null;
}
