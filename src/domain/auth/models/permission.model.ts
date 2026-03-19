// permission.model.ts
// Định nghĩa kiểu permission và các hằng số permission mẫu.
// Backend có thể trả về chuỗi bất kỳ – dùng string type cho linh hoạt.

/** Kiểu permission – là chuỗi định danh quyền truy cập */
export type UserPermission = string;

/**
 * Các permission mẫu trong hệ thống.
 * Dùng để kiểm tra quyền một cách nhất quán, tránh lỗi typo chuỗi.
 */
export const PERMISSIONS = {
  /** Xem thông tin user hiện tại */
  AUTH_ME: 'AUTH_ME',

  /** Đọc danh sách học sinh */
  STUDENT_READ: 'STUDENT_READ',

  /** Thêm/sửa học sinh */
  STUDENT_WRITE: 'STUDENT_WRITE',

  /** Ghi nhận/cập nhật feedback */
  FEEDBACK_WRITE: 'FEEDBACK_WRITE',

  /** Xem dữ liệu tài chính */
  FINANCE_READ: 'FINANCE_READ',

  /** Chỉnh sửa dữ liệu tài chính */
  FINANCE_WRITE: 'FINANCE_WRITE',

  /** Xem dữ liệu học thử (Trials) */
  TRIALS_READ: 'TRIALS_READ',

  /** Chỉnh sửa dữ liệu học thử (Trials) */
  TRIALS_WRITE: 'TRIALS_WRITE',

  /** Xem nhật ký hệ thống (audit log) */
  SYSTEM_AUDIT_READ: 'SYSTEM_AUDIT_READ',
} as const satisfies Record<string, UserPermission>;
