// index.tsx
// Cấu hình router trung tâm cập nhật bọc DashboardLayout cho các pages bên trong.

import { createBrowserRouter, Navigate } from "react-router-dom";
import { useAppSelector } from "@/app/store/hooks";
import { RoutePaths } from "@/app/router/route-paths";
import ProtectedRoute from "@/app/router/protected-route";
import { DashboardLayout } from "@/presentation/layouts/dashboard-layout";

// Pages
import LoginPage from "@/presentation/pages/auth/login.page";
import DashboardPage from "@/presentation/pages/dashboard/dashboard.page";
import ForbiddenPage from "@/presentation/pages/errors/forbidden.page";
import NotFoundPage from "@/presentation/pages/errors/not-found.page";
import RoleGuard from "@/app/router/role-guard";
import { DefaultRedirectPage } from "@/app/router/default-redirect-page";
import { AppRoles } from "@/shared/constants/roles";

// Curriculum Pages
import { ProgramListPage } from "@/presentation/pages/curriculum/program-list.page";
import { ProgramDetailPage } from "@/presentation/pages/curriculum/program-detail.page";
import { ProgramFormPage } from "@/presentation/pages/curriculum/program-form.page";

// Students Pages
import StudentListPage from "@/presentation/pages/students/student-list.page";
import StudentDetailPage from "@/presentation/pages/students/student-detail.page";
import StudentFormPage from "@/presentation/pages/students/student-form.page";

// Classes Pages
import { ClassListPage } from "@/presentation/pages/classes/class-list.page";
import { ClassFormPage } from "@/presentation/pages/classes/class-form.page";
import ClassDetailPage from "@/presentation/pages/classes/class-detail.page";

// Sessions Pages
import SessionDetailPage from "@/presentation/pages/sessions/session-detail.page";
import SessionListPage from "@/presentation/pages/sessions/session-list.page";
import MySessionsPage from "@/presentation/pages/sessions/my-sessions.page";

// Feedback Pages
import SessionFeedbackPage from "@/presentation/pages/feedback/session-feedback.page";
import StudentScoreHistoryPage from "@/presentation/pages/feedback/student-score-history.page";

// Trials Pages
import TrialListPage from "@/presentation/pages/trials/trial-list.page";
import TrialDetailPage from "@/presentation/pages/trials/trial-detail.page";
import TrialFormPage from "@/presentation/pages/trials/trial-form.page";

// Finance Pages
import FeePlanListPage from "@/presentation/pages/finance/fee-plan-list.page";
import InvoiceListPage from "@/presentation/pages/finance/invoice-list.page";
import InvoiceDetailPage from "@/presentation/pages/finance/invoice-detail.page";
import StudentFinancePage from "@/presentation/pages/finance/student-finance.page";
import StudentPaymentStatusListPage from "@/presentation/pages/finance/student-payment-status-list.page";
 
// System Pages
import NotificationsPage from "@/presentation/pages/system/notifications.page";
import AuditLogPage from "@/presentation/pages/system/audit-log.page";
import UserManagementPage from "@/presentation/pages/system/user-management.page";

// Wrapper check Auth Guard trước khi render Dashboard Layout
const ProtectedDashboardLayout = () => {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const initialized = useAppSelector((s) => s.auth.initialized);

  return (
    <ProtectedRoute isAuthenticated={isAuthenticated} initialized={initialized}>
      <DashboardLayout />
    </ProtectedRoute>
  );
};

export const router = createBrowserRouter([
  {
    path: RoutePaths.ROOT,
    element: <DefaultRedirectPage />,
  },
  {
    path: RoutePaths.LOGIN,
    element: <LoginPage />,
  },
  {
    // Layout bọc cấp root cho toàn hệ thống sau đăng nhập
    path: "/",
    element: <ProtectedDashboardLayout />,
    children: [
      {
        path: RoutePaths.DASHBOARD,
        element: <DashboardPage />,
      },
      // Module Học viên
      {
        path: RoutePaths.STUDENTS,
        element: (
          <RoleGuard
            allowedRoles={[
              AppRoles.ROOT,
              AppRoles.DIRECTOR,
              AppRoles.ACADEMIC,
              AppRoles.SALES, AppRoles.ACCOUNTANT,
              AppRoles.TEACHER,
            ]}
          >
            <StudentListPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.STUDENT_NEW,
        element: (
          <RoleGuard
            allowedRoles={[AppRoles.ROOT, AppRoles.DIRECTOR, AppRoles.ACADEMIC, AppRoles.SALES, AppRoles.ACCOUNTANT]}
          >
            <StudentFormPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.STUDENT_DETAIL,
        element: (
          <RoleGuard
            allowedRoles={[
              AppRoles.ROOT,
              AppRoles.DIRECTOR,
              AppRoles.ACADEMIC,
              AppRoles.SALES, AppRoles.ACCOUNTANT,
              AppRoles.TEACHER,
            ]}
          >
            <StudentDetailPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.STUDENT_EDIT,
        element: (
          <RoleGuard
            allowedRoles={[AppRoles.ROOT, AppRoles.DIRECTOR, AppRoles.ACADEMIC, AppRoles.SALES, AppRoles.ACCOUNTANT]}
          >
            <StudentFormPage />
          </RoleGuard>
        ),
      },      // Module Chương trình học
      {
        path: RoutePaths.CURRICULUM_PROGRAMS,
        element: (
          <RoleGuard
            allowedRoles={[
              AppRoles.ROOT,
              AppRoles.DIRECTOR,
              AppRoles.ACADEMIC,
              AppRoles.SALES, AppRoles.ACCOUNTANT,
              AppRoles.TEACHER,
            ]}
          >
            <ProgramListPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.CURRICULUM_PROGRAM_NEW,
        element: (
          <RoleGuard
            allowedRoles={[AppRoles.ROOT, AppRoles.DIRECTOR, AppRoles.ACADEMIC]}
          >
            <ProgramFormPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.CURRICULUM_PROGRAM_DETAIL,
        element: (
          <RoleGuard
            allowedRoles={[
              AppRoles.ROOT,
              AppRoles.DIRECTOR,
              AppRoles.ACADEMIC,
              AppRoles.SALES, AppRoles.ACCOUNTANT,
              AppRoles.TEACHER,
            ]}
          >
            <ProgramDetailPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.CURRICULUM_PROGRAM_EDIT,
        element: (
          <RoleGuard
            allowedRoles={[AppRoles.ROOT, AppRoles.DIRECTOR, AppRoles.ACADEMIC]}
          >
            <ProgramFormPage />
          </RoleGuard>
        ),
      },

      // Module Lớp học
      // Các route này được phân quyền dựa trên yêu cầu: academic, director, root xem được; teacher xem được nhưng không edit
      {
        path: RoutePaths.CLASSES,
        element: (
          // Cho phép Teacher xem danh sách lớp học
          <RoleGuard
            allowedRoles={[
              AppRoles.ROOT,
              AppRoles.DIRECTOR,
              AppRoles.ACADEMIC,
              AppRoles.SALES, AppRoles.ACCOUNTANT,
              AppRoles.TEACHER,
            ]}
          >
            <ClassListPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.CLASS_NEW,
        element: (
          // Chỉ các role quản lý vận hành (Root, Academic) mới được tạo lớp
          <RoleGuard
            allowedRoles={[AppRoles.ROOT, AppRoles.ACADEMIC]}
          >
            <ClassFormPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.CLASS_DETAIL,
        element: (
          // Teacher và các role quản lý đều có thể xem chi tiết lớp
          <RoleGuard
            allowedRoles={[
              AppRoles.ROOT,
              AppRoles.DIRECTOR,
              AppRoles.ACADEMIC,
              AppRoles.SALES, AppRoles.ACCOUNTANT,
              AppRoles.TEACHER,
            ]}
          >
            <ClassDetailPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.CLASS_EDIT,
        element: (
          // Director read-only: chỉ Root/Academic được truy cập route chỉnh sửa này
          <RoleGuard
            allowedRoles={[AppRoles.ROOT, AppRoles.ACADEMIC]}
          >
            <ClassFormPage />
          </RoleGuard>
        ),
      },

      // Module Sessions
      {
        path: RoutePaths.SESSIONS,
        element: <Navigate to={RoutePaths.CLASSES} replace />,
      },
      {
        path: RoutePaths.SESSIONS_LIST,
        element: (
          <RoleGuard
            allowedRoles={[
              AppRoles.ROOT,
              AppRoles.DIRECTOR,
              AppRoles.ACADEMIC,
              AppRoles.SALES, AppRoles.ACCOUNTANT,
              AppRoles.TEACHER,
            ]}
          >
            <SessionListPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.SESSION_DETAIL,
        element: (
          <RoleGuard
            allowedRoles={[
              AppRoles.DIRECTOR,
              AppRoles.ACADEMIC,
              AppRoles.TEACHER,
            ]}
          >
            <SessionDetailPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.MY_SESSIONS,
        element: (
          <RoleGuard allowedRoles={[AppRoles.TEACHER]}>
            <MySessionsPage />
          </RoleGuard>
        ),
      },

      // Module Feedback & Điểm số
      {
        // Trang nhập nhận xét & điểm số theo buổi học:
        // Teacher được xem+ghi (nếu đúng session của mình, kiểm tra nội bộ trong page),
        // Academic/Director được xem (read-only, kiểm tra nội bộ trong page)
        path: RoutePaths.SESSION_FEEDBACK,
        element: (
          <RoleGuard
            allowedRoles={[
              AppRoles.DIRECTOR,
              AppRoles.ACADEMIC,
              AppRoles.TEACHER,
            ]}
          >
            <SessionFeedbackPage />
          </RoleGuard>
        ),
      },
      {
        // Trang lịch sử điểm số theo học viên:
        // Teacher và các role quản lý đều xem được
        path: RoutePaths.STUDENT_SCORE_HISTORY,
        element: (
          <RoleGuard
            allowedRoles={[
              AppRoles.DIRECTOR,
              AppRoles.ACADEMIC,
              AppRoles.SALES, AppRoles.ACCOUNTANT,
              AppRoles.TEACHER,
            ]}
          >
            <StudentScoreHistoryPage />
          </RoleGuard>
        ),
      },
      
      // Module Học thử (Trials)
      {
        path: RoutePaths.TRIALS,
        element: (
          <RoleGuard
            allowedRoles={[AppRoles.ROOT, AppRoles.DIRECTOR, AppRoles.ACADEMIC, AppRoles.SALES]}
          >
            <TrialListPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.TRIAL_CREATE,
        element: (
          <RoleGuard
            // Chỉ các role có quyền ghi (WRITE) mới được tạo lead
            allowedRoles={[AppRoles.ROOT, AppRoles.SALES]}
          >
            <TrialFormPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.TRIAL_DETAIL,
        element: (
          <RoleGuard
            allowedRoles={[AppRoles.ROOT, AppRoles.DIRECTOR, AppRoles.ACADEMIC, AppRoles.SALES]}
          >
            <TrialDetailPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.TRIAL_EDIT,
        element: (
          <RoleGuard
            // Chỉ các role có quyền ghi (WRITE) mới được cập nhật lead
            allowedRoles={[AppRoles.ROOT, AppRoles.SALES]}
          >
            <TrialFormPage />
          </RoleGuard>
        ),
      },

      // Module Tài chính
      // Redirect parent paths để tránh 404 khi bookmark/gõ URL
      {
        path: RoutePaths.FINANCE_ROOT,
        element: <Navigate to={RoutePaths.INVOICES} replace />,
      },
      {
        path: RoutePaths.CURRICULUM_ROOT,
        element: <Navigate to={RoutePaths.CURRICULUM_PROGRAMS} replace />,
      },
      {
        path: RoutePaths.SYSTEM_ROOT,
        element: <Navigate to={RoutePaths.NOTIFICATIONS} replace />,
      },
      {
        path: RoutePaths.FEE_PLANS,
        element: (
          <RoleGuard allowedRoles={[AppRoles.ROOT, AppRoles.DIRECTOR, AppRoles.ACCOUNTANT, AppRoles.ACADEMIC]}>
            <FeePlanListPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.INVOICES,
        element: (
          <RoleGuard allowedRoles={[AppRoles.ROOT, AppRoles.DIRECTOR, AppRoles.ACCOUNTANT, AppRoles.ACADEMIC]}>
            <InvoiceListPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.STUDENT_PAYMENT_STATUS,
        element: (
          <RoleGuard allowedRoles={[AppRoles.ROOT, AppRoles.DIRECTOR, AppRoles.ACCOUNTANT, AppRoles.ACADEMIC]}>
            <StudentPaymentStatusListPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.INVOICE_DETAIL,
        element: (
          <RoleGuard allowedRoles={[AppRoles.ROOT, AppRoles.DIRECTOR, AppRoles.ACCOUNTANT, AppRoles.ACADEMIC]}>
            <InvoiceDetailPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.STUDENT_FINANCE,
        element: (
          <RoleGuard allowedRoles={[AppRoles.ROOT, AppRoles.DIRECTOR, AppRoles.ACCOUNTANT, AppRoles.ACADEMIC]}>
            <StudentFinancePage />
          </RoleGuard>
        ),
      },
 
      // Module Hệ thống
      {
        path: RoutePaths.NOTIFICATIONS,
        element: <NotificationsPage />,
      },
      {
        path: RoutePaths.AUDIT_LOGS,
        element: (
          <RoleGuard allowedRoles={[AppRoles.ROOT, AppRoles.DIRECTOR]}>
            <AuditLogPage />
          </RoleGuard>
        ),
      },
      {
        path: RoutePaths.USER_MANAGEMENT,
        element: (
          <RoleGuard allowedRoles={[AppRoles.ROOT]}>
            <UserManagementPage />
          </RoleGuard>
        ),
      },

      {
        path: RoutePaths.FORBIDDEN,
        element: <ForbiddenPage />,
      },
      {
        // Nhúng 404 cho mọi url rác phía sau protected route
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
  {
    // Backup 404 cho root top-level
    path: "*",
    element: <NotFoundPage />,
  },
]);
