/**
 * Central route paths. `RoutePaths` dùng trong router; `PATHS` alias cho menu/layout cũ.
 */
export const RoutePaths = {
  ROOT: '/',
  LOGIN: '/login',
  DASHBOARD: '/',

  USERS: '/users',
  USER_DETAIL: '/users/:id',
  USER_CREATE: '/users/create',
  USER_EDIT: '/users/:id/edit',
  USER_MANAGEMENT: '/users',

  STUDENTS: '/students',
  STUDENT_NEW: '/students/create',
  STUDENT_DETAIL: '/students/:id',
  STUDENT_EDIT: '/students/:id/edit',
  STUDENT_SCORE_HISTORY: '/students/:studentId/scores',

  CURRICULUM_ROOT: '/curriculum',
  CURRICULUM_PROGRAMS: '/curriculum/programs',
  CURRICULUM_PROGRAM_NEW: '/curriculum/programs/new',
  CURRICULUM_PROGRAM_DETAIL: '/curriculum/programs/:programId',
  CURRICULUM_PROGRAM_EDIT: '/curriculum/programs/:programId/edit',

  CLASSES: '/classes',
  CLASS_NEW: '/classes/create',
  CLASS_DETAIL: '/classes/:classId',
  CLASS_EDIT: '/classes/:classId/edit',
  SESSIONS: '/sessions',
  SESSIONS_LIST: '/classes/:classId/sessions',
  SESSION_DETAIL: '/sessions/:sessionId',
  SESSION_FEEDBACK: '/sessions/:sessionId/feedback',
  MY_SESSIONS: '/my-sessions',

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
  RECEIPT_NEW: '/finance/receipts/create',
  RECEIPT_DETAIL: '/finance/receipts/:id',
  PAYMENT_STATUS: '/finance/payment-status',
  FINANCE_DASHBOARD: '/finance/dashboard',
  REFUND_REQUESTS: '/finance/refund-requests',
  PAYROLL: '/payroll',
  PAYROLL_NEW: '/payroll/create',
  PAYROLL_DETAIL: '/payroll/:id',

  SYSTEM_ROOT: '/system',
  NOTIFICATIONS: '/system/notifications',
  AUDIT_LOGS: '/system/audit-logs',
  DEMO_CONTROL_CENTER: '/system/demo',

  PAUSE_REQUESTS: '/pause-requests',
  MAKEUP_SESSIONS: '/makeup-sessions',
  SEARCH: '/search',

  FORBIDDEN: '/forbidden',
  NOT_FOUND: '*',
} as const;

export type RoutePathKey = keyof typeof RoutePaths;
export type RoutePathValue = (typeof RoutePaths)[RoutePathKey];

/** @deprecated Dùng RoutePaths — giữ để sidebar / import cũ */
export const PATHS = RoutePaths;
