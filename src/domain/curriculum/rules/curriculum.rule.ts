import type { ProgramLevel } from "../models/program.model";
import type { SessionPattern } from "../models/lesson.model";

/**
 * Lấy nhãn hiển thị cho cấp độ chương trình
 */
export const getProgramLevelLabel = (level: ProgramLevel | string): string => {
  const labels: Record<string, string> = {
    KINDY: "Mầm non (Kindy)",
    STARTERS: "Starters",
    MOVERS: "Movers",
    FLYERS: "Flyers",
  };
  return labels[level] || level;
};

/**
 * Lấy nhãn hiển thị cho pattern của session
 */
export const getSessionPatternLabel = (pattern: SessionPattern | string): string => {
  const labels: Record<string, string> = {
    "1&2": "Trải nghiệm 1 & 2",
    "3": "Ôn tập 3",
    "4&5": "Thực hành 4 & 5",
    "6&7": "Kiểm tra 6 & 7",
  };
  return labels[pattern] || pattern;
};

/**
 * Kiểm tra quyền chỉnh sửa curriculum dựa vào roles
 * ROOT, DIRECTOR, ACADEMIC được sửa
 * SALES, ACCOUNTANT, TEACHER chỉ đọc
 */
export const canEditCurriculum = (userRoles?: string[]): boolean => {
  if (!userRoles || userRoles.length === 0) return false;
  
  const allowedRoles = ["ROOT", "DIRECTOR", "ACADEMIC"];
  return userRoles.some((role) => allowedRoles.includes(role));
};
