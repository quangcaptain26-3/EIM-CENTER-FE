/**
 * Model dữ liệu cho Trial Lead (khách hàng tiềm năng học thử)
 * Ánh xạ trực tiếp từ API response của backend TrialLead entity
 * Sử dụng trong toàn bộ domain trials của frontend
 */

// ===================================================
// TRẠNG THÁI CỦA TRIAL LEAD
// ===================================================

/**
 * Enum định nghĩa các trạng thái trong vòng đời của một Trial Lead
 * - NEW: Mới tạo, chưa liên hệ
 * - CONTACTED: Đã liên hệ, đang tư vấn
 * - SCHEDULED: Đã đặt lịch học thử
 * - ATTENDED: Đã tham gia học thử
 * - NO_SHOW: Đã đặt lịch nhưng không đến
 * - CONVERTED: Đã chuyển đổi thành học viên chính thức
 * - CLOSED: Đã đóng (từ chối hoặc hết hạn)
 */
export type TrialStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'SCHEDULED'
  | 'ATTENDED'
  | 'NO_SHOW'
  | 'CONVERTED'
  | 'CLOSED';

/**
 * Danh sách tất cả giá trị TrialStatus hợp lệ (dùng cho dropdown, filter)
 */
export const TRIAL_STATUS_VALUES: TrialStatus[] = [
  'NEW',
  'CONTACTED',
  'SCHEDULED',
  'ATTENDED',
  'NO_SHOW',
  'CONVERTED',
  'CLOSED',
];

/**
 * Nhãn hiển thị tiếng Việt cho từng trạng thái Trial
 */
export const TRIAL_STATUS_LABELS: Record<TrialStatus, string> = {
  NEW: 'Mới',
  CONTACTED: 'Đã liên hệ',
  SCHEDULED: 'Đã đặt lịch',
  ATTENDED: 'Đã tham gia',
  NO_SHOW: 'Vắng mặt',
  CONVERTED: 'Đã chuyển đổi',
  CLOSED: 'Đã đóng',
};

// ===================================================
// MODEL TRIAL LEAD
// ===================================================

/**
 * Thông tin lịch học thử được nhúng trong TrialLeadModel
 * Ánh xạ từ schedule object trả về trong API response
 */
export type TrialScheduleEmbedded = {
  /** ID của lịch học thử */
  id: string;
  /** ID lớp học được xếp cho buổi học thử */
  classId: string;
  /** Ngày giờ học thử (ISO string) */
  trialDate: string;
};

/**
 * Model chính đại diện cho một Trial Lead (khách hàng tiềm năng)
 * Ánh xạ từ response của TrialsMapper.toResponse() ở backend
 */
export type TrialLeadModel = {
  /** ID duy nhất của trial lead */
  id: string;
  /** Họ và tên khách hàng tiềm năng / học viên */
  fullName: string;
  /** Số điện thoại liên hệ */
  phone: string;
  /** Địa chỉ email (tùy chọn) */
  email?: string | null;
  /** Nguồn tiếp cận (Facebook, Zalo, Giới thiệu, ...) */
  source?: string | null;
  /** Trạng thái hiện tại của trial lead */
  status: TrialStatus;
  /** Ghi chú nội bộ */
  note?: string | null;
  /** ID của nhân viên tạo lead này */
  createdBy?: string | null;
  /** Ngày tạo (ISO string) */
  createdAt: string;
  /** Lịch học thử, chỉ có khi đã đặt lịch */
  schedule?: TrialScheduleEmbedded | null;
  /** Thông tin chuyển đổi, chỉ có khi status là CONVERTED */
  conversion?: {
    studentId: string;
    enrollmentId: string;
    convertedAt: string;
  } | null;
};
