/**
 * notification.model.ts
 * Định nghĩa model domain cho Thông báo hệ thống.
 */

/** Các loại thông báo trong hệ thống */
export const NotificationType = {
  OVERDUE_INVOICE: 'OVERDUE_INVOICE',     // Hoá đơn quá hạn
  RENEWAL_NEEDED: 'RENEWAL_NEEDED',       // Cần gia hạn khoá học
  TRIAL_PENDING: 'TRIAL_PENDING',         // Có Trial Lead mới cần xử lý
  SESSION_UNASSIGNED: 'SESSION_UNASSIGNED', // Buổi học chưa được gán giáo viên
} as const;

export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

/** Model đại diện cho một thông báo gửi tới người dùng */
export interface NotificationModel {
  id: string;             // UUID định danh thông báo
  userId: string;         // ID người nhận thông báo
  type: NotificationType; // Phân loại thông báo
  title: string;          // Tiêu đề ngắn gọn
  body: string;           // Nội dung chi tiết (backend map message -> body)
  isRead: boolean;        // Trạng thái đã đọc hay chưa
  createdAt: string;      // Thời điểm tạo (ISO string)
  readAt: string | null;  // Thời điểm đọc (nếu có)
}
