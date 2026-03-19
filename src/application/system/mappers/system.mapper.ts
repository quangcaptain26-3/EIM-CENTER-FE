/**
 * system.mapper.ts
 * Chuyển đổi dữ liệu thô từ API (Raw Data) sang Domain Model.
 */

import { type NotificationModel, NotificationType } from '@/domain/system/models/notification.model';
import { type AuditLogModel, AuditAction } from '@/domain/system/models/audit-log.model';

/**
 * Mapper cho Thông báo hệ thống.
 * Chuyển message từ BE thành body trong FE model.
 */
export const mapToNotificationModel = (raw: any): NotificationModel => {
  return {
    id: raw.id,
    userId: raw.userId,
    // Ở BE có thể chưa trả về type, ta mặc định hoặc map từ text nếu cần
    type: (raw.type as NotificationType) || NotificationType.OVERDUE_INVOICE,
    title: raw.title,
    body: raw.body || '', // Đọc field body trực tiếp từ BE sau khi đã được chuẩn hoá (đổi từ message -> body)
    isRead: !!raw.isRead,
    createdAt: raw.createdAt,
    readAt: raw.readAt || null,
  };
};

/**
 * Mapper cho Nhật ký kiểm toán.
 * Ánh xạ các trường entity và meta từ BE sang entityType, beforeData, afterData.
 */
export const mapToAuditLogModel = (raw: any): AuditLogModel => {
  return {
    id: raw.id,
    actorUserId: raw.actorUserId || null,
    // BE mapAuditLog chưa có actorUserName, FE có thể lấy từ meta hoặc field bổ sung sau này
    actorUserName: raw.actorUserName || raw.meta?.actorName || 'Hệ thống',
    action: (raw.action as AuditAction) || raw.action,
    entityType: raw.entity || 'UNKNOWN',
    entityId: raw.entityId || null,
    // BE mapAuditLog đã được cập nhật để trả về beforeData/afterData trực tiếp
    beforeData: raw.beforeData || raw.meta?.before || null,
    afterData: raw.afterData || raw.meta?.after || null,
    createdAt: raw.createdAt,
  };
};
