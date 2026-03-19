/**
 * audit-log.model.ts
 * Định nghĩa model domain cho Nhật ký kiểm toán hệ thống.
 */

/** Các hành động cơ bản được ghi log */
export const AuditAction = {
  CREATE: 'CREATE',               // Tạo mới dữ liệu
  UPDATE: 'UPDATE',               // Cập nhật dữ liệu
  DELETE: 'DELETE',               // Xoá dữ liệu
  IMPORT: 'IMPORT',               // Nhập dữ liệu từ Excel/CSV
  EXPORT: 'EXPORT',               // Xuất dữ liệu ra file
  STATUS_CHANGE: 'STATUS_CHANGE', // Thay đổi trạng thái (ví dụ Duyệt thu / Huỷ)
} as const;

export type AuditAction = typeof AuditAction[keyof typeof AuditAction];

/** Model đại diện cho một bản ghi nhật ký kiểm toán */
export interface AuditLogModel {
  id: string;                      // UUID định danh log
  actorUserId: string | null;      // ID người thực hiện (null nếu là hệ thống)
  actorUserName: string | null;    // Tên người thực hiện (để hiển thị nhanh)
  action: AuditAction | string;    // Hành động được thực hiện
  entityType: string;              // Loại đối tượng (e.g., 'STUDENT', 'INVOICE')
  entityId: string | null;         // ID của đối tượng bị tác động
  beforeData: Record<string, any> | null; // Dữ liệu trước khi thay đổi
  afterData: Record<string, any> | null;  // Dữ liệu sau khi thay đổi
  createdAt: string;               // Thời điểm thực hiện (ISO string)
}
