/** GET /search?q= — nhóm kết quả */
export interface GlobalSearchStudentHit {
  id: string;
  fullName: string;
  studentCode: string;
  status?: string;
}

export interface GlobalSearchUserHit {
  id: string;
  fullName: string;
  userCode?: string;
  roleCode?: string;
}

export interface GlobalSearchClassHit {
  id: string;
  classCode: string;
  programName?: string;
  status?: string;
}

export interface GlobalSearchResponse {
  students: GlobalSearchStudentHit[];
  users: GlobalSearchUserHit[];
  classes: GlobalSearchClassHit[];
}

export type GlobalSearchFlatItem =
  | { kind: 'student'; data: GlobalSearchStudentHit }
  | { kind: 'user'; data: GlobalSearchUserHit }
  | { kind: 'class'; data: GlobalSearchClassHit };
