/* eslint-disable react-refresh/only-export-components -- router factory cùng file với wrapper layout */
import { Suspense, type ReactElement } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAppSelector } from '@/app/store/hooks';
import { selectIsAuthenticated, selectIsInitialized } from '@/app/store/auth.selectors';
import { RoutePaths } from '@/app/router/route-paths';
import ProtectedRoute from '@/app/router/protected-route';
import RoleGuard from '@/app/router/role-guard';
import { UserDetailAccess } from '@/app/router/user-detail-access';
import { DashboardLayout } from '@/presentation/layouts/dashboard-layout';
import { DefaultRedirectPage } from '@/app/router/default-redirect-page';
import { PageLoader } from '@/presentation/layouts/page-loader';
import { ROLES } from '@/shared/constants/roles';
import * as P from '@/app/router/lazy-pages';

const { ADMIN, ACADEMIC, ACCOUNTANT, TEACHER } = ROLES;

const S = (el: ReactElement) => <Suspense fallback={<PageLoader />}>{el}</Suspense>;

const ProtectedDashboardLayout = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isInitialized = useAppSelector(selectIsInitialized);
  return (
    <ProtectedRoute isAuthenticated={isAuthenticated} isInitialized={isInitialized}>
      <DashboardLayout />
    </ProtectedRoute>
  );
};

export const router = createBrowserRouter([
  { path: RoutePaths.ROOT, element: <DefaultRedirectPage /> },
  { path: RoutePaths.UPCOMING, element: S(<P.LazyUpcomingClassesPage />) },
  { path: RoutePaths.LOGIN, element: S(<P.LazyLoginPage />) },
  { path: RoutePaths.FORBIDDEN, element: S(<P.LazyForbiddenPage />) },
  {
    path: '/',
    element: <ProtectedDashboardLayout />,
    children: [
      { index: true, element: <P.LazyDashboardPage /> },
      {
        path: RoutePaths.SEARCH,
        element: <P.LazySearchPage />,
      },
      {
        path: RoutePaths.USERS,
        element: (
          <RoleGuard allowedRoles={[ADMIN]}>
            <P.LazyUserManagementPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.USER_CREATE,
        element: (
          <RoleGuard allowedRoles={[ADMIN]}>
            <P.LazyUserCreatePage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.USER_DETAIL,
        element: (
          <UserDetailAccess>
            <P.LazyUserDetailPage />
          </UserDetailAccess>
        ),
      },
      {
        path: RoutePaths.STUDENTS,
        element: (
          <RoleGuard allowedRoles={[ADMIN, ACADEMIC]}>
            <P.LazyStudentListPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.STUDENT_NEW,
        element: (
          <RoleGuard allowedRoles={[ADMIN, ACADEMIC]}>
            <P.LazyStudentFormPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.STUDENT_DETAIL,
        element: (
          <RoleGuard allowedRoles={[ADMIN, ACADEMIC]}>
            <P.LazyStudentDetailPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.STUDENT_EDIT,
        element: (
          <RoleGuard allowedRoles={[ADMIN, ACADEMIC]}>
            <P.LazyStudentFormPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.PAUSE_REQUESTS,
        element: (
          <RoleGuard allowedRoles={[ADMIN, ACADEMIC]}>
            <P.LazyPauseRequestsPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.MAKEUP_SESSIONS,
        element: (
          <RoleGuard allowedRoles={[ADMIN, ACADEMIC]}>
            <P.LazyMakeupSessionsPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.CURRICULUM_PROGRAMS,
        element: (
          <RoleGuard allowedRoles={[ADMIN, ACADEMIC, ACCOUNTANT, TEACHER]}>
            <P.LazyProgramListPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.CURRICULUM_PROGRAM_NEW,
        element: (
          <RoleGuard allowedRoles={[ADMIN, ACADEMIC]}>
            <P.LazyProgramFormPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.CURRICULUM_PROGRAM_DETAIL,
        element: (
          <RoleGuard allowedRoles={[ADMIN, ACADEMIC, ACCOUNTANT, TEACHER]}>
            <P.LazyProgramDetailPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.CURRICULUM_PROGRAM_EDIT,
        element: (
          <RoleGuard allowedRoles={[ADMIN, ACADEMIC]}>
            <P.LazyProgramFormPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.CLASSES,
        element: (
          <RoleGuard allowedRoles={[ADMIN, ACADEMIC]}>
            <P.LazyClassListPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.CLASS_NEW,
        element: (
          <RoleGuard allowedRoles={[ADMIN, ACADEMIC]}>
            <P.LazyClassFormPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.CLASS_ENROLL_STUDENT,
        element: (
          <RoleGuard allowedRoles={[ADMIN, ACADEMIC]}>
            <P.LazyClassEnrollStudentPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.CLASS_DETAIL,
        element: (
          <RoleGuard allowedRoles={[ADMIN, ACADEMIC]}>
            <P.LazyClassDetailPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.CLASS_EDIT,
        element: (
          <RoleGuard allowedRoles={[ADMIN, ACADEMIC]}>
            <P.LazyClassFormPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.SESSIONS,
        element: (
          <RoleGuard allowedRoles={[ADMIN, ACADEMIC, TEACHER]}>
            <P.LazySessionListPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.SESSIONS_LIST,
        element: (
          <RoleGuard allowedRoles={[ADMIN, ACADEMIC]}>
            <P.LazySessionListPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.SESSION_DETAIL,
        element: (
          <RoleGuard allowedRoles={[ADMIN, ACADEMIC, TEACHER]}>
            <P.LazySessionDetailPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.MY_SESSIONS,
        element: (
          <RoleGuard allowedRoles={[ADMIN, ACADEMIC, TEACHER]}>
            <P.LazyMySessionsPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.SESSION_FEEDBACK,
        element: (
          <RoleGuard allowedRoles={[ADMIN, ACADEMIC, TEACHER]}>
            <P.LazySessionFeedbackPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.STUDENT_SCORE_HISTORY,
        element: (
          <RoleGuard allowedRoles={[ADMIN, ACADEMIC]}>
            <P.LazyStudentScoreHistoryPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.TRIALS,
        element: (
          <RoleGuard allowedRoles={[ADMIN, ACADEMIC]}>
            <P.LazyTrialListPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.TRIAL_CREATE,
        element: (
          <RoleGuard allowedRoles={[ADMIN, ACADEMIC]}>
            <P.LazyTrialFormPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.TRIAL_DETAIL,
        element: (
          <RoleGuard allowedRoles={[ADMIN, ACADEMIC]}>
            <P.LazyTrialDetailPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.TRIAL_EDIT,
        element: (
          <RoleGuard allowedRoles={[ADMIN, ACADEMIC]}>
            <P.LazyTrialFormPage />
          </RoleGuard>
        ),
      },
      { path: RoutePaths.FINANCE_ROOT, element: <Navigate to={RoutePaths.FINANCE_DASHBOARD} replace /> },
      { path: RoutePaths.CURRICULUM_ROOT, element: <Navigate to={RoutePaths.CURRICULUM_PROGRAMS} replace /> },
      { path: RoutePaths.SYSTEM_ROOT, element: <Navigate to={RoutePaths.USERS} replace /> },
      {
        path: RoutePaths.FEE_PLANS,
        element: (
          <RoleGuard allowedRoles={[ADMIN, ACCOUNTANT, ACADEMIC]}>
            <P.LazyFeePlanListPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.INVOICES,
        element: (
          <RoleGuard allowedRoles={[ADMIN, ACCOUNTANT, ACADEMIC]}>
            <P.LazyInvoiceListPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.STUDENT_PAYMENT_STATUS,
        element: (
          <RoleGuard allowedRoles={[ADMIN, ACCOUNTANT, ACADEMIC]}>
            <P.LazyPaymentStatusPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.RECEIPTS,
        element: (
          <RoleGuard allowedRoles={[ADMIN, ACCOUNTANT]}>
            <P.LazyReceiptListPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.RECEIPT_NEW,
        element: (
          <RoleGuard allowedRoles={[ADMIN, ACCOUNTANT]}>
            <P.LazyReceiptFormPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.RECEIPT_DETAIL,
        element: (
          <RoleGuard allowedRoles={[ADMIN, ACCOUNTANT]}>
            <P.LazyReceiptDetailPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.FINANCE_DASHBOARD,
        element: (
          <RoleGuard allowedRoles={[ADMIN, ACCOUNTANT]}>
            <P.LazyFinanceDashboardPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.PAYROLL,
        element: (
          <RoleGuard allowedRoles={[ADMIN, ACCOUNTANT]}>
            <P.LazyPayrollListPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.PAYROLL_NEW,
        element: (
          <RoleGuard allowedRoles={[ADMIN, ACCOUNTANT]}>
            <P.LazyPayrollFormPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.PAYROLL_DETAIL,
        element: (
          <RoleGuard allowedRoles={[ADMIN, ACCOUNTANT]}>
            <P.LazyPayrollDetailPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.REFUND_REQUESTS,
        element: (
          <RoleGuard allowedRoles={[ADMIN, ACCOUNTANT]}>
            <P.LazyRefundRequestsPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.INVOICE_DETAIL,
        element: (
          <RoleGuard allowedRoles={[ADMIN, ACCOUNTANT, ACADEMIC]}>
            <P.LazyInvoiceDetailPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.STUDENT_FINANCE,
        element: (
          <RoleGuard allowedRoles={[ADMIN, ACCOUNTANT, ACADEMIC]}>
            <P.LazyStudentFinancePage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.NOTIFICATIONS,
        element: (
          <RoleGuard allowedRoles={[ADMIN]}>
            <P.LazyNotificationsPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.AUDIT_LOGS,
        element: (
          <RoleGuard allowedRoles={[ADMIN]}>
            <P.LazyAuditLogPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.DEMO_CONTROL_CENTER,
        element: (
          <RoleGuard allowedRoles={[ADMIN]}>
            <P.LazyDemoControlCenterPage />
          </RoleGuard>
        ),
      },
      { path: '*', element: <P.LazyNotFoundPage /> },
    ],
  },
]);
