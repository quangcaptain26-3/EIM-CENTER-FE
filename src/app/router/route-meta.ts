import { RoutePaths } from './route-paths';
import type { AppRole } from '@/shared/constants/roles';
import { AppRoles } from '@/shared/constants/roles';

/**
 * Kiểu dữ liệu định nghĩa metadata cho một route.
 * Dùng chung cho cấu hình Sidebar, Breadcrumb, và logic Guard phân quyền.
 */
export interface AppRouteMeta {
  /** Định danh duy nhất của route */
  key: string;
  /** Nhãn hiển thị trên UI (Tên menu, breadcrumb) */
  label: string;
  /** Đường dẫn url của route */
  path: string;
  /** Tên icon hoặc biểu tượng dùng cho sidebar menu (tùy chọn) */
  icon?: string;
  /** Mảng các role được phép truy cập. Không khai báo thì ai cũng vào được (tùy logic guard) */
  allowedRoles?: AppRole[];
  /** Mảng các role có quyền đọc (Read-only) */
  readRoles?: AppRole[];
  /** Mảng các role có quyền ghi (Create/Edit/Delete) */
  writeRoles?: AppRole[];
  /** Xác định xem route này có nên hiển thị ở sidebar menu không */
  showInSidebar?: boolean;
  /** Xác định xem route này có nên hiển thị trong breadcrumb không */
  showInBreadcrumb?: boolean;
  /** Key của route cha (nếu nằm trong menu con hoặc breadcrumb cấp thấp) */
  parentKey?: string;
  /** Mảng các menu/route con */
  children?: AppRouteMeta[];
}

/**
 * Danh sách metadata của tất cả route chính trong hệ thống.
 * Chứa cấu hình role, label hiển thị, icon,...
 */
export const appRouteMetaList: AppRouteMeta[] = [
  {
    key: 'dashboard',
    label: 'Tổng quan',
    path: RoutePaths.DASHBOARD,
    icon: 'dashboard',
    allowedRoles: [AppRoles.ROOT, AppRoles.DIRECTOR, AppRoles.ACADEMIC, AppRoles.SALES, AppRoles.ACCOUNTANT, AppRoles.TEACHER],
    showInSidebar: true,
    showInBreadcrumb: true,
  },
  {
    key: 'curriculum',
    label: 'Chương trình học',
    path: RoutePaths.CURRICULUM_ROOT,
    icon: 'book',
    // Tất cả role đều có thể nhìn thấy menu curriculum (nhưng chi tiết thì filter sau)
    allowedRoles: [AppRoles.ROOT, AppRoles.DIRECTOR, AppRoles.ACADEMIC, AppRoles.SALES, AppRoles.ACCOUNTANT, AppRoles.TEACHER],
    showInSidebar: true,
    showInBreadcrumb: true,
    children: [
      {
        key: 'curriculum-programs',
        label: 'Khóa học & Lộ trình',
        path: RoutePaths.CURRICULUM_PROGRAMS,
        parentKey: 'curriculum',
        allowedRoles: [AppRoles.ROOT, AppRoles.DIRECTOR, AppRoles.ACADEMIC, AppRoles.SALES, AppRoles.ACCOUNTANT, AppRoles.TEACHER],
        showInSidebar: true,
        showInBreadcrumb: true,
      },
      {
        key: 'curriculum-programs-new',
        label: 'Tạo chương trình học',
        path: RoutePaths.CURRICULUM_PROGRAM_NEW,
        parentKey: 'curriculum-programs',
        // Chỉ ACADEMIC, ROOT, DIRECTOR mới có quyền tạo
        allowedRoles: [AppRoles.ROOT, AppRoles.DIRECTOR, AppRoles.ACADEMIC],
        showInSidebar: false,
        showInBreadcrumb: true,
      },
      {
        key: 'curriculum-programs-detail',
        label: 'Chi tiết chương trình',
        path: RoutePaths.CURRICULUM_PROGRAM_DETAIL,
        parentKey: 'curriculum-programs',
        allowedRoles: [AppRoles.ROOT, AppRoles.DIRECTOR, AppRoles.ACADEMIC, AppRoles.SALES, AppRoles.ACCOUNTANT, AppRoles.TEACHER],
        showInSidebar: false,
        showInBreadcrumb: true,
      },
      {
        key: 'curriculum-programs-edit',
        label: 'Cập nhật chương trình',
        path: RoutePaths.CURRICULUM_PROGRAM_EDIT,
        parentKey: 'curriculum-programs-detail',
        allowedRoles: [AppRoles.ROOT, AppRoles.DIRECTOR, AppRoles.ACADEMIC],
        showInSidebar: false,
        showInBreadcrumb: true,
      }
    ]
  },
  {
    key: 'students',
    label: 'Học viên',
    path: RoutePaths.STUDENTS,
    icon: 'users',
    allowedRoles: [AppRoles.ROOT, AppRoles.DIRECTOR, AppRoles.ACADEMIC, AppRoles.SALES, AppRoles.ACCOUNTANT, AppRoles.TEACHER],
    showInSidebar: true,
    showInBreadcrumb: true,
    children: [
      {
        key: 'students-new',
        label: 'Thêm học viên',
        path: RoutePaths.STUDENT_NEW,
        parentKey: 'students',
        allowedRoles: [AppRoles.ROOT, AppRoles.DIRECTOR, AppRoles.ACADEMIC, AppRoles.SALES, AppRoles.ACCOUNTANT],
        showInSidebar: false,
        showInBreadcrumb: true,
      },
      {
        key: 'students-detail',
        label: 'Chi tiết học viên',
        path: RoutePaths.STUDENT_DETAIL,
        parentKey: 'students',
        allowedRoles: [AppRoles.ROOT, AppRoles.DIRECTOR, AppRoles.ACADEMIC, AppRoles.SALES, AppRoles.ACCOUNTANT, AppRoles.TEACHER],
        showInSidebar: false,
        showInBreadcrumb: true,
        children: [
          {
            // Breadcrumb: Học viên > Chi tiết > Lịch sử điểm số
            key: 'student-score-history',
            label: 'Lịch sử điểm số',
            path: RoutePaths.STUDENT_SCORE_HISTORY,
            parentKey: 'students-detail',
            allowedRoles: [AppRoles.DIRECTOR, AppRoles.ACADEMIC, AppRoles.SALES, AppRoles.ACCOUNTANT, AppRoles.TEACHER],
            showInSidebar: false,
            showInBreadcrumb: true,
          }
        ]
      },
      {
        key: 'students-edit',
        label: 'Cập nhật học viên',
        path: RoutePaths.STUDENT_EDIT,
        parentKey: 'students-detail',
        allowedRoles: [AppRoles.ROOT, AppRoles.DIRECTOR, AppRoles.ACADEMIC, AppRoles.SALES, AppRoles.ACCOUNTANT],
        showInSidebar: false,
        showInBreadcrumb: true,
      }
    ]
  },
  {
    key: 'classes',
    label: 'Quản lý lớp học',
    path: RoutePaths.CLASSES,
    icon: 'chalkboard-teacher',
    // Chỉ hiện trên sidebar đối với các role quản lý (không hiện cho Teacher)
    allowedRoles: [AppRoles.ROOT, AppRoles.DIRECTOR, AppRoles.ACADEMIC],
    showInSidebar: true,
    showInBreadcrumb: true,
    children: [
      {
        key: 'classes-new',
        label: 'Tạo lớp mới',
        path: RoutePaths.CLASS_NEW,
        parentKey: 'classes',
        allowedRoles: [AppRoles.ROOT, AppRoles.ACADEMIC],
        showInSidebar: false,
        showInBreadcrumb: true,
      },
      {
        key: 'classes-detail',
        label: 'Chi tiết lớp học',
        path: RoutePaths.CLASS_DETAIL,
        parentKey: 'classes',
        allowedRoles: [AppRoles.ROOT, AppRoles.DIRECTOR, AppRoles.ACADEMIC, AppRoles.SALES, AppRoles.ACCOUNTANT, AppRoles.TEACHER],
        showInSidebar: false,
        showInBreadcrumb: true,
        children: [
          {
            key: 'sessions-list',
            label: 'Danh sách buổi học',
            path: RoutePaths.SESSIONS_LIST,
            parentKey: 'classes-detail',
            allowedRoles: [AppRoles.ROOT, AppRoles.DIRECTOR, AppRoles.ACADEMIC, AppRoles.SALES, AppRoles.ACCOUNTANT, AppRoles.TEACHER],
            showInSidebar: false,
            showInBreadcrumb: true,
          }
        ]
      },
      {
        key: 'classes-edit',
        label: 'Sửa thông tin lớp',
        path: RoutePaths.CLASS_EDIT,
        parentKey: 'classes-detail',
        allowedRoles: [AppRoles.ROOT, AppRoles.ACADEMIC],
        showInSidebar: false,
        showInBreadcrumb: true,
      }
    ]
  },
  {
    key: 'sessions',
    label: 'Quản lý buổi học',
    // Hiện tại chưa có list buổi học tổng quát, dẫn người dùng vào danh sách lớp để chọn lớp
    path: RoutePaths.CLASSES,
    icon: 'calendar',
    allowedRoles: [AppRoles.ROOT, AppRoles.DIRECTOR, AppRoles.ACADEMIC],
    showInSidebar: true,
    showInBreadcrumb: true,
    children: [
      {
        key: 'sessions-detail',
        label: 'Chi tiết buổi học',
        path: RoutePaths.SESSION_DETAIL,
        parentKey: 'sessions',
        allowedRoles: [AppRoles.ROOT, AppRoles.DIRECTOR, AppRoles.ACADEMIC, AppRoles.TEACHER],
        showInSidebar: false,
        showInBreadcrumb: true,
        children: [
          {
            // Breadcrumb: Buổi học > Chi tiết > Nhận xét & Điểm
            key: 'sessions-feedback',
            label: 'Nhận xét & Điểm số',
            path: RoutePaths.SESSION_FEEDBACK,
            parentKey: 'sessions-detail',
            allowedRoles: [AppRoles.DIRECTOR, AppRoles.ACADEMIC, AppRoles.TEACHER],
            showInSidebar: false,
            showInBreadcrumb: true,
          }
        ]
      }
    ]
  },
  {
    key: 'my-sessions',
    label: 'Buổi học của tôi',
    path: RoutePaths.MY_SESSIONS,
    icon: 'calendar-check',
    allowedRoles: [AppRoles.TEACHER],
    showInSidebar: true,
    showInBreadcrumb: true,
  },
  {
    key: 'trials',
    label: 'Tuyển sinh',
    path: RoutePaths.TRIALS,
    icon: 'calendar-alt',
    allowedRoles: [AppRoles.ROOT, AppRoles.DIRECTOR, AppRoles.ACADEMIC, AppRoles.SALES],
    showInSidebar: true,
    showInBreadcrumb: true,
    children: [
      {
        key: 'trials-list',
        label: 'Danh sách học thử',
        path: RoutePaths.TRIALS, // Trùng path với cha để hiển thị như menu item đầu tiên
        parentKey: 'trials',
        allowedRoles: [AppRoles.ROOT, AppRoles.DIRECTOR, AppRoles.ACADEMIC, AppRoles.SALES],
        showInSidebar: true,
        showInBreadcrumb: false, // Trùng path nên ẩn ở breadcrumb của child
      },
      {
        key: 'trials-new',
        label: 'Thêm lead mới',
        path: RoutePaths.TRIAL_CREATE,
        parentKey: 'trials',
        // Chỉ các role có quyền ghi (WRITE) mới được tạo lead
        allowedRoles: [AppRoles.ROOT, AppRoles.SALES],
        showInSidebar: false,
        showInBreadcrumb: true,
      },
      {
        key: 'trials-detail',
        label: 'Chi tiết học thử',
        path: RoutePaths.TRIAL_DETAIL,
        parentKey: 'trials',
        allowedRoles: [AppRoles.ROOT, AppRoles.DIRECTOR, AppRoles.ACADEMIC, AppRoles.SALES],
        showInSidebar: false,
        showInBreadcrumb: true,
      },
      {
        key: 'trials-edit',
        label: 'Cập nhật học thử',
        path: RoutePaths.TRIAL_EDIT,
        parentKey: 'trials-detail',
        // Chỉ các role có quyền ghi (WRITE) mới được cập nhật lead
        allowedRoles: [AppRoles.ROOT, AppRoles.SALES],
        showInSidebar: false,
        showInBreadcrumb: true,
      },
    ],
  },
  {
    key: 'finance',
    label: 'Tài chính',
    path: RoutePaths.FINANCE_ROOT,
    icon: 'dollar-sign',
    // Root, Director, Accountant, Academic có quyền vào module tài chính
    allowedRoles: [AppRoles.ROOT, AppRoles.DIRECTOR, AppRoles.ACCOUNTANT, AppRoles.ACADEMIC],
    readRoles: [AppRoles.ROOT, AppRoles.DIRECTOR, AppRoles.ACCOUNTANT, AppRoles.ACADEMIC],
    writeRoles: [AppRoles.ROOT, AppRoles.ACCOUNTANT],
    showInSidebar: true,
    showInBreadcrumb: true,
    children: [
      {
        key: 'finance-fee-plans',
        label: 'Gói học phí',
        path: RoutePaths.FEE_PLANS,
        parentKey: 'finance',
        // Chỉ Accountant và Root mới có quyền config gói phí (viết), Director/Academic chỉ xem
        allowedRoles: [AppRoles.ROOT, AppRoles.DIRECTOR, AppRoles.ACCOUNTANT, AppRoles.ACADEMIC],
        readRoles: [AppRoles.ROOT, AppRoles.DIRECTOR, AppRoles.ACCOUNTANT, AppRoles.ACADEMIC],
        writeRoles: [AppRoles.ROOT, AppRoles.ACCOUNTANT],
        showInSidebar: true,
        showInBreadcrumb: true,
      },
      {
        key: 'finance-invoices',
        label: 'Hóa đơn',
        path: RoutePaths.INVOICES,
        parentKey: 'finance',
        allowedRoles: [AppRoles.ROOT, AppRoles.DIRECTOR, AppRoles.ACCOUNTANT, AppRoles.ACADEMIC],
        readRoles: [AppRoles.ROOT, AppRoles.DIRECTOR, AppRoles.ACCOUNTANT, AppRoles.ACADEMIC],
        writeRoles: [AppRoles.ROOT, AppRoles.ACCOUNTANT],
        showInSidebar: true,
        showInBreadcrumb: true,
      },
      {
        key: 'finance-invoice-detail',
        label: 'Chi tiết hóa đơn',
        path: RoutePaths.INVOICE_DETAIL,
        parentKey: 'finance-invoices',
        allowedRoles: [AppRoles.ROOT, AppRoles.DIRECTOR, AppRoles.ACCOUNTANT, AppRoles.ACADEMIC],
        readRoles: [AppRoles.ROOT, AppRoles.DIRECTOR, AppRoles.ACCOUNTANT, AppRoles.ACADEMIC],
        writeRoles: [AppRoles.ROOT, AppRoles.ACCOUNTANT],
        showInSidebar: false,
        showInBreadcrumb: true,
      },
      {
        key: 'finance-student-finance',
        label: 'Tài chính học viên',
        path: RoutePaths.STUDENT_FINANCE,
        parentKey: 'finance-invoices',
        allowedRoles: [AppRoles.ROOT, AppRoles.DIRECTOR, AppRoles.ACCOUNTANT, AppRoles.ACADEMIC],
        readRoles: [AppRoles.ROOT, AppRoles.DIRECTOR, AppRoles.ACCOUNTANT, AppRoles.ACADEMIC],
        writeRoles: [AppRoles.ROOT, AppRoles.ACCOUNTANT],
        showInSidebar: false,
        showInBreadcrumb: true,
      }
    ]
  },
  {
    key: 'system',
    label: 'Hệ thống',
    path: RoutePaths.SYSTEM_ROOT,
    icon: 'cogs',
    allowedRoles: [AppRoles.ROOT, AppRoles.DIRECTOR, AppRoles.ACADEMIC, AppRoles.SALES, AppRoles.ACCOUNTANT, AppRoles.TEACHER],
    showInSidebar: true,
    showInBreadcrumb: true,
    children: [
      {
        key: 'notifications',
        label: 'Thông báo',
        path: RoutePaths.NOTIFICATIONS,
        parentKey: 'system',
        allowedRoles: [AppRoles.ROOT, AppRoles.DIRECTOR, AppRoles.ACADEMIC, AppRoles.SALES, AppRoles.ACCOUNTANT, AppRoles.TEACHER],
        showInSidebar: true,
        showInBreadcrumb: true,
      },
      {
        key: 'audit-logs',
        label: 'Nhật ký hoạt động',
        path: RoutePaths.AUDIT_LOGS,
        parentKey: 'system',
        allowedRoles: [AppRoles.ROOT, AppRoles.DIRECTOR],
        showInSidebar: true,
        showInBreadcrumb: true,
      },
      {
        key: 'user-management',
        label: 'Quản lý người dùng',
        path: RoutePaths.USER_MANAGEMENT,
        parentKey: 'system',
        allowedRoles: [AppRoles.ROOT],
        showInSidebar: true,
        showInBreadcrumb: true,
      }
    ]
  }
];
