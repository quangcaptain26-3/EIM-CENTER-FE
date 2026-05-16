export const ENROLLMENT_STATUS = {
  reserved: 'reserved',
  pending: 'pending',
  trial: 'trial',
  active: 'active',
  paused: 'paused',
  transferred: 'transferred',
  dropped: 'dropped',
  completed: 'completed',
} as const;

export const ATTENDANCE_STATUS = {
  present: 'present',
  late: 'late',
  absent_excused: 'absent_excused',
  absent_unexcused: 'absent_unexcused',
} as const;

export const SESSION_STATUS = {
  pending: 'pending',
  completed: 'completed',
  cancelled: 'cancelled',
} as const;

export const COVER_STATUS = {
  pending: 'pending',
  confirmed: 'confirmed',
  completed: 'completed',
  cancelled: 'cancelled',
} as const;

export const PAUSE_STATUS = {
  pending: 'pending',
  approved: 'approved',
  rejected: 'rejected',
} as const;

export const REFUND_REASON_TYPES = {
  center_unable_to_open: 'Trung tâm không mở được lớp',
  subjective_no_interest: 'Không còn hứng thú học',
  subjective_schedule_conflict: 'Bận lịch cá nhân',
  subjective_financial: 'Khó khăn tài chính',
  subjective_relocation: 'Chuyển nơi ở',
  subjective_class_transfer: 'Chuyển sang lớp khác (cùng trình độ)',
  subjective_other: 'Lý do cá nhân khác',
  special_case: 'Trường hợp đặc biệt',
} as const;
