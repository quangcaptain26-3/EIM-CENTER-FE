/**
 * Central route paths. `RoutePaths` dùng trong router; `PATHS` alias cho menu/layout cũ.
 */
export const RoutePaths = {
  ROOT: '/',
  UPCOMING: '/upcoming',
  LOGIN: '/auth/login',
  DASHBOARD: '/',

  USERS: '/system/users',
  USER_DETAIL: '/system/users/:id',
  USER_CREATE: '/system/users/new',
  USER_EDIT: '/system/users/:id/edit',
  USER_MANAGEMENT: '/system/users',

  STUDENTS: '/students',
  STUDENT_NEW: '/students/new',
  STUDENT_DETAIL: '/students/:id',
  STUDENT_EDIT: '/students/:id/edit',
  STUDENT_SCORE_HISTORY: '/students/:studentId/scores',

  CURRICULUM_ROOT: '/curriculum',
  CURRICULUM_PROGRAMS: '/curriculum/programs',
  CURRICULUM_PROGRAM_NEW: '/curriculum/programs/new',
  CURRICULUM_PROGRAM_DETAIL: '/curriculum/programs/:programId',
  CURRICULUM_PROGRAM_EDIT: '/curriculum/programs/:programId/edit',

  CLASSES: '/classes',
  CLASS_NEW: '/classes/new',
  CLASS_DETAIL: '/classes/:classId',
  /** Ghi danh học viên có sẵn vào lớp (tách khỏi tạo HV mới) */
  CLASS_ENROLL_STUDENT: '/classes/:classId/enroll',
  CLASS_EDIT: '/classes/:classId/edit',
  SESSIONS: '/sessions',
  SESSIONS_LIST: '/classes/:classId/sessions',
  SESSION_DETAIL: '/sessions/:sessionId',
  SESSION_FEEDBACK: '/sessions/:sessionId/feedback',
  MY_SESSIONS: '/sessions/my',

  TRIALS: '/trials',
  TRIAL_CREATE: '/trials/new',
  TRIAL_DETAIL: '/trials/:id',
  TRIAL_EDIT: '/trials/:id/edit',

  FINANCE_ROOT: '/finance',
  FEE_PLANS: '/finance/fee-plans',
  INVOICES: '/finance/invoices',
  INVOICE_DETAIL: '/finance/invoices/:id',
  STUDENT_PAYMENT_STATUS: '/finance/payment-status',
  STUDENT_FINANCE: '/finance/students/:enrollmentId',
  RECEIPTS: '/finance/receipts',
  RECEIPT_NEW: '/finance/receipts/new',
  RECEIPT_DETAIL: '/finance/receipts/:id',
  PAYMENT_STATUS: '/finance/payment-status',
  FINANCE_DASHBOARD: '/finance/dashboard',
  REFUND_REQUESTS: '/finance/refund-requests',
  PAYROLL: '/finance/payrolls',
  PAYROLL_NEW: '/finance/payrolls/new',
  PAYROLL_DETAIL: '/finance/payrolls/:id',

  SYSTEM_ROOT: '/system',
  NOTIFICATIONS: '/system/notifications',
  AUDIT_LOGS: '/system/audit-log',
  DEMO_CONTROL_CENTER: '/system/demo',

  PAUSE_REQUESTS: '/students/pause-requests',
  MAKEUP_SESSIONS: '/students/makeup-sessions',
  SEARCH: '/search',

  FORBIDDEN: '/forbidden',
  NOT_FOUND: '*',
} as const;

export type RoutePathKey = keyof typeof RoutePaths;
export type RoutePathValue = (typeof RoutePaths)[RoutePathKey];

/** @deprecated Dùng RoutePaths — giữ để sidebar / import cũ */
export const PATHS = RoutePaths;
