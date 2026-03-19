/**
 * Các cấp độ của chương trình học
 */
export type ProgramLevel = "KINDY" | "STARTERS" | "MOVERS" | "FLYERS";

export const PROGRAM_LEVELS = ["KINDY", "STARTERS", "MOVERS", "FLYERS"] as const;

/**
 * Model đại diện cho một chương trình học (Program)
 */
export type ProgramModel = {
  id: string;
  code: string;
  name: string;
  level: ProgramLevel;
  totalUnits: number;
  lessonsPerUnit: number;
  sessionsPerWeek: number;
  feePlanId?: string;
  createdAt: string;
};
