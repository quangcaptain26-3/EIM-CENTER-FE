import { AppRoles } from "@/shared/constants/roles";
import type { SessionModel } from "@/domain/sessions/models/session.model";

export interface FeedbackVisibilityContext {
  /** Roles hiện tại của user */
  roles: string[];
  /** User id hiện tại */
  userId?: string | null;
  /** Session đang thao tác */
  session: SessionModel;
}

export interface SessionFeedbackVisibility {
  /** Có được sửa form inline hay không */
  canEdit: boolean;
  /** Lý do read-only để UI hiển thị */
  readonlyReason: string | null;

  /** Action visibility */
  canDownloadTemplate: boolean;
  canExportReport: boolean;
  canImportFeedback: boolean;
}

/**
 * Rule hiển thị action cho trang Session Feedback (tầng UX).
 *
 * Lưu ý quan trọng:
 * - Đây chỉ là visibility rule ở FE để trải nghiệm hợp lý.
 * - Không thay thế authorization ở Backend.
 *
 * Teacher xem được tất cả feedback của lớp mình (kể cả buổi trước): Backend enforce qua
 * enforceTeacherCanReadSession (class_staff hoặc main/cover bất kỳ buổi). FE dùng
 * teacherEffectiveId cho canEdit — chỉ cho sửa buổi mình dạy/cover.
 */
export const getSessionFeedbackVisibility = (
  ctx: FeedbackVisibilityContext,
): SessionFeedbackVisibility => {
  const { roles, userId, session } = ctx;

  const isTeacher = roles.includes(AppRoles.TEACHER);
  const isEffectiveTeacher = !!userId && session.teacherEffectiveId === userId;

  // Nhóm quản lý được xem, nhưng không nên sửa thay giáo viên.
  const managerReadOnlyRoles: readonly string[] = [
    AppRoles.ACADEMIC,
    AppRoles.DIRECTOR,
    AppRoles.ROOT,
    AppRoles.SALES,
    AppRoles.ACCOUNTANT,
  ];
  const isManagerReadOnly = roles.some((r) => managerReadOnlyRoles.includes(r));

  // Nhóm được phép dùng các action excel/report (theo BE export ownership + quy ước sản phẩm hiện tại).
  const privilegedActionRoles: readonly string[] = [AppRoles.ACADEMIC, AppRoles.DIRECTOR];
  const isPrivilegedForActions = roles.some((r) => privilegedActionRoles.includes(r));

  const canEdit = (isTeacher && isEffectiveTeacher) && !isManagerReadOnly;

  let readonlyReason: string | null = null;
  if (isManagerReadOnly) {
    readonlyReason = "Chế độ Xem — Quản lý không thể sửa đánh giá thay Giáo viên.";
  } else if (isTeacher && !isEffectiveTeacher) {
    readonlyReason = "Chế độ Xem — Bạn không phải là Giáo viên trực tiếp đứng lớp buổi này.";
  }

  const canUseActionsAsTeacher = isTeacher && isEffectiveTeacher;
  const canUseActions = isPrivilegedForActions || canUseActionsAsTeacher;

  return {
    canEdit,
    readonlyReason,
    canDownloadTemplate: canUseActions,
    canExportReport: canUseActions,
    canImportFeedback: canUseActions,
  };
};

