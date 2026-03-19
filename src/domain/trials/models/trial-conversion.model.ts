/**
 * Model dữ liệu cho kết quả chuyển đổi Trial Lead sang học viên chính thức
 * Ánh xạ từ TrialConversion entity ở backend và response của convertTrialUseCase
 */

/**
 * Model đại diện cho kết quả convert một Trial Lead
 * Được tạo khi trial lead được chuyển đổi thành học viên + enrollment
 */
export type TrialConversionModel = {
  /** ID của bản ghi chuyển đổi */
  id: string;
  /** ID trial lead nguồn */
  trialId: string;
  /** ID học viên vừa được tạo */
  studentId: string;
  /** ID ghi danh (enrollment) được tạo kèm */
  enrollmentId: string;
  /** Thời điểm thực hiện chuyển đổi (ISO string) */
  convertedAt: string;
};

/**
 * Kết quả trả về từ API khi convert thành công
 * Ánh xạ từ response của POST /trials/:id/convert
 */
export type ConvertTrialResult = {
  /** Thông điệp xác nhận từ server */
  message: string;
  /** Thông tin bản ghi chuyển đổi */
  conversion: TrialConversionModel;
  /** ID học viên vừa được tạo (tiện truy cập nhanh) */
  studentId: string;
  /** ID ghi danh vừa được tạo (tiện truy cập nhanh) */
  enrollmentId: string;
};
