/** Khớp GET /dashboard/stats (BE `DashboardStatsResult`) */

export interface RevenueChartPoint {
  month: string;
  cash: number;
  accrual: number;
}

export interface EnrollmentProgramSlice {
  program: string;
  count: number;
  color: string;
}

export interface TodaySessionItem {
  id: string;
  classCode: string;
  teacherName: string;
  roomName: string;
  shift: number;
  shiftLabel: string;
  status: string;
  statusLabel: string;
  highlight: boolean;
}

export interface RecentActivityItem {
  action: string;
  description: string;
  entityCode: string | null;
  actorName: string | null;
  eventTime: string;
}

export interface TopDebtorRow {
  enrollmentId: string;
  studentId: string;
  studentName: string;
  classCode: string;
  debt: number;
  parentPhone: string | null;
}

export interface TeacherPayrollPendingRow {
  id: string;
  fullName: string;
  openSessions: number;
}

export interface RevenueByProgramSlice {
  program: string;
  value: number;
}

export interface TeacherWeekDay {
  date: string;
  label: string;
  isToday: boolean;
  sessions: {
    id: string;
    classCode: string;
    shift: number;
    shiftLabel: string;
    roomName: string;
    status: string;
    canAttendance: boolean;
  }[];
}

export interface TeacherDashboardSlice {
  sessionsDoneThisMonth: number;
  upcomingSessions: number;
  estimatedSalaryMonth: number;
  salaryPerSession: number;
  activeClasses: number;
  attendanceSummary: {
    present: number;
    late: number;
    absentExcused: number;
    absentUnexcused: number;
  };
  weekDays: TeacherWeekDay[];
}

export interface DashboardWarningCard {
  code: 'PENDING_WITH_RECEIPT_OVER_60_DAYS' | 'RESERVED_OVER_30_DAYS' | 'TRIAL_NOT_ACTIVATED_OVER_LIMIT';
  title: string;
  message: string;
  count: number;
}

export interface DashboardStats {
  role: string;
  totalStudents: number;
  activeEnrollments: number;
  trialEnrollments: number;
  pausedEnrollments: number;
  totalClasses: number;
  activeClasses: number;
  totalSessions24h: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  revenueMomPercent: number | null;
  enrollmentActivationThisMonth: number;
  enrollmentActivationLastMonth: number;
  enrollmentActivationMomPercent: number | null;
  totalDebt: number;
  pendingRefunds: number;
  pendingPauseRequests: number;
  makeupBlockedCount: number;
  studentsWithDebtCount: number;
  pendingCoverSessions: number;
  todaySessions: TodaySessionItem[];
  revenueChart: RevenueChartPoint[];
  enrollmentsByProgram: EnrollmentProgramSlice[];
  recentActivities: RecentActivityItem[];
  topDebtors?: TopDebtorRow[];
  teachersPendingPayroll?: TeacherPayrollPendingRow[];
  revenueByProgram?: RevenueByProgramSlice[];
  cashThisMonth?: number;
  accrualThisMonth?: number;
  teacher?: TeacherDashboardSlice;
  warnings?: DashboardWarningCard[];
}
