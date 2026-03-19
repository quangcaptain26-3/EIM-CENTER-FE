/**
 * Pattern của session/bài học
 */
export type SessionPattern = "1&2" | "3" | "4&5" | "6&7";

/**
 * Model đại diện cho một bài học (Lesson) trong Unit
 */
export type UnitLessonModel = {
  id: string;
  unitId: string;
  lessonNo: number;
  title: string;
  sessionPattern: SessionPattern;
  createdAt: string;
};
