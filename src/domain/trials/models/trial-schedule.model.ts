/**
 * Model dữ liệu cho lịch học thử (Trial Schedule)
 * Dùng làm DTO trong các form đặt lịch / cập nhật lịch
 * Ánh xạ từ ScheduleTrialBody của backend
 */

/**
 * Model đại diện cho một lịch học thử
 * Tương ứng với ScheduleTrialSchema ở backend (classId + trialDate)
 */
export type TrialScheduleModel = {
  /** ID của trial lead được xếp lịch này */
  trialId: string;
  /** ID lớp học được chọn cho buổi học thử */
  classId: string;
  /** Ngày giờ học thử (ISO string) */
  trialDate: string;
};
