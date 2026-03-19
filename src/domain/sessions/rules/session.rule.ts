/**
 * src/domain/sessions/rules/session.rule.ts
 * Các quy tắc nghiệp vụ (Business Rules) liên quan đến quản lý buổi học (Session)
 */

import { SessionType } from "../models/session.model";

/**
 * Kiểm tra xem buổi học có phải là buổi khảo thí/kiểm tra hay không
 * @param type Phân loại buổi học
 * @returns true nếu là bài kiểm tra (QUIZ, MIDTERM, FINAL)
 */
export const isAssessmentSession = (type: SessionType): boolean => {
  return (
    type === SessionType.QUIZ ||
    type === SessionType.MIDTERM ||
    type === SessionType.FINAL
  );
};

/**
 * Kiểm tra quyền có được phép chỉnh sửa thông tin buổi học không
 * Về mặt quy tắc nghiệp vụ, chỉ những người có vai trò Học thuật (Academic) trở lên mới được chỉnh sửa.
 * @param userRole Vai trò của người dùng trong hệ thống
 * @returns true nếu người dùng có quyền cập nhật
 */
export const canEditSession = (userRole: string): boolean => {
  return userRole === "ACADEMIC" || userRole === "ROOT" || userRole === "DIRECTOR";
};

/**
 * Kiểm tra quyền xếp giáo viên dạy thay (Cover Teacher) cho một buổi học
 * Về mặt quy tắc nghiệp vụ, chức năng này áp dụng cho Academic / Root.
 * @param userRole Vai trò của người dùng trong hệ thống
 * @returns true nếu người dùng có quyền chỉ định giáo viên dạy thay
 */
export const canCoverSession = (userRole: string): boolean => {
  return userRole === "ACADEMIC" || userRole === "ROOT" || userRole === "DIRECTOR";
};
