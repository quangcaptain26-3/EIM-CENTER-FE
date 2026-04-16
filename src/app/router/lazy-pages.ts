import { lazy } from 'react';

export const LazyLoginPage = lazy(() => import('@/presentation/pages/auth/login.page'));
export const LazyDashboardPage = lazy(() => import('@/presentation/pages/dashboard/dashboard.page'));
export const LazyForbiddenPage = lazy(() => import('@/presentation/pages/errors/forbidden.page'));
export const LazyNotFoundPage = lazy(() => import('@/presentation/pages/errors/not-found.page'));

export const LazyProgramListPage = lazy(() =>
  import('@/presentation/pages/curriculum/program-list.page').then((m) => ({ default: m.ProgramListPage })),
);
export const LazyProgramDetailPage = lazy(() =>
  import('@/presentation/pages/curriculum/program-detail.page').then((m) => ({ default: m.ProgramDetailPage })),
);
export const LazyProgramFormPage = lazy(() =>
  import('@/presentation/pages/curriculum/program-form.page').then((m) => ({ default: m.ProgramFormPage })),
);

export const LazyStudentListPage = lazy(() => import('@/presentation/pages/students/student-list.page'));
export const LazyStudentDetailPage = lazy(() => import('@/presentation/pages/students/student-detail.page'));
export const LazyStudentFormPage = lazy(() => import('@/presentation/pages/students/student-form.page'));
export const LazyPauseRequestsPage = lazy(() => import('@/presentation/pages/students/pause-requests.page'));
export const LazyMakeupSessionsPage = lazy(() => import('@/presentation/pages/students/makeup-sessions.page'));

export const LazyClassListPage = lazy(() =>
  import('@/presentation/pages/classes/class-list.page').then((m) => ({ default: m.ClassListPage })),
);
export const LazyClassFormPage = lazy(() =>
  import('@/presentation/pages/classes/class-form.page').then((m) => ({ default: m.ClassFormPage })),
);
export const LazyClassDetailPage = lazy(() => import('@/presentation/pages/classes/class-detail.page'));

export const LazySessionDetailPage = lazy(() => import('@/presentation/pages/sessions/session-detail.page'));
export const LazySessionListPage = lazy(() => import('@/presentation/pages/sessions/session-list.page'));
export const LazyMySessionsPage = lazy(() => import('@/presentation/pages/sessions/my-sessions.page'));

export const LazySessionFeedbackPage = lazy(() => import('@/presentation/pages/feedback/session-feedback.page'));
export const LazyStudentScoreHistoryPage = lazy(() =>
  import('@/presentation/pages/feedback/student-score-history.page'),
);

export const LazyTrialListPage = lazy(() => import('@/presentation/pages/trials/trial-list.page'));
export const LazyTrialDetailPage = lazy(() => import('@/presentation/pages/trials/trial-detail.page'));
export const LazyTrialFormPage = lazy(() => import('@/presentation/pages/trials/trial-form.page'));

export const LazyFeePlanListPage = lazy(() => import('@/presentation/pages/finance/fee-plan-list.page'));
export const LazyInvoiceListPage = lazy(() => import('@/presentation/pages/finance/invoice-list.page'));
export const LazyInvoiceDetailPage = lazy(() => import('@/presentation/pages/finance/invoice-detail.page'));
export const LazyStudentFinancePage = lazy(() => import('@/presentation/pages/finance/student-finance.page'));
export const LazyPaymentStatusPage = lazy(() => import('@/presentation/pages/finance/payment-status.page'));
export const LazyReceiptListPage = lazy(() => import('@/presentation/pages/finance/receipt-list.page'));
export const LazyReceiptFormPage = lazy(() => import('@/presentation/pages/finance/receipt-form.page'));
export const LazyReceiptDetailPage = lazy(() => import('@/presentation/pages/finance/receipt-detail.page'));
export const LazyFinanceDashboardPage = lazy(() => import('@/presentation/pages/finance/finance-dashboard.page'));
export const LazyPayrollListPage = lazy(() => import('@/presentation/pages/finance/payroll-list.page'));
export const LazyPayrollFormPage = lazy(() => import('@/presentation/pages/finance/payroll-form.page'));
export const LazyPayrollDetailPage = lazy(() => import('@/presentation/pages/finance/payroll-detail.page'));
export const LazyRefundRequestsPage = lazy(() => import('@/presentation/pages/finance/refund-requests.page'));

export const LazyNotificationsPage = lazy(() => import('@/presentation/pages/system/notifications.page'));
export const LazyAuditLogPage = lazy(() => import('@/presentation/pages/system/audit-log.page'));
export const LazyUserManagementPage = lazy(() => import('@/presentation/pages/system/user-management.page'));
export const LazyUserDetailPage = lazy(() => import('@/presentation/pages/system/user-detail.page'));
export const LazyUserCreatePage = lazy(() => import('@/presentation/pages/system/user-create.page'));
export const LazySearchPage = lazy(() => import('@/presentation/pages/system/search.page'));
export const LazyDemoControlCenterPage = lazy(() =>
  import('@/presentation/pages/system/demo-control-center.page'),
);
