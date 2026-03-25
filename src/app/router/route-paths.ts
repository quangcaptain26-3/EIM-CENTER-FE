// route-paths.ts
// Tập trung tất cả đường dẫn (path) của ứng dụng vào một nơi.
// Luôn dùng RoutePaths thay vì viết string path trực tiếp để tránh lỗi typo.

export const RoutePaths = {
  // ── Chung ────────────────────────────────────────
  ROOT: '/',
  LOGIN: '/login',

  // ── Tổng quan ────────────────────────────────────
  DASHBOARD: '/dashboard',

  // ── Chương trình học ─────────────────────────────
  CURRICULUM_ROOT: '/curriculum',
  CURRICULUM_PROGRAMS: '/curriculum/programs',
  CURRICULUM_PROGRAM_NEW: '/curriculum/programs/new',
  CURRICULUM_PROGRAM_DETAIL: '/curriculum/programs/:programId',
  CURRICULUM_PROGRAM_EDIT: '/curriculum/programs/:programId/edit',

  // ── Học viên ─────────────────────────────────────
  STUDENTS: '/students',
  STUDENT_NEW: '/students/new',
  STUDENT_DETAIL: '/students/:id',
  STUDENT_EDIT: '/students/:id/edit',
  // Trang lịch sử điểm số của một học viên cụ thể
  STUDENT_SCORE_HISTORY: '/students/:studentId/scores',

  // ── Lớp học ──────────────────────────────────────
  CLASSES: '/classes',
  CLASS_NEW: '/classes/new',
  CLASS_DETAIL: '/classes/:classId',
  CLASS_EDIT: '/classes/:classId/edit',

  // ── Buổi học (Sessions) ──────────────────────────
  SESSIONS: '/sessions',
  MY_SESSIONS: '/my-sessions',
  SESSIONS_LIST: '/classes/:classId/sessions',
  SESSION_DETAIL: '/sessions/:sessionId',
  // Trang nhập nhận xét & điểm số cho một buổi học cụ thể
  SESSION_FEEDBACK: '/sessions/:sessionId/feedback',

  // ── Thử học ──────────────────────────────────────
  TRIALS: '/trials',
  TRIAL_CREATE: '/trials/new',
  TRIAL_DETAIL: '/trials/:id',
  TRIAL_EDIT: '/trials/:id/edit',

  // ── Tài chính ────────────────────────────────────
  FINANCE_ROOT: '/finance',
  FEE_PLANS: '/finance/fee-plans',
  INVOICES: '/finance/invoices',       // Danh sách hóa đơn
  INVOICE_DETAIL: '/finance/invoices/:id',
  STUDENT_PAYMENT_STATUS: '/finance/student-payment-status', // Danh sách đã đóng/chưa đóng
  STUDENT_FINANCE: '/finance/enrollments/:enrollmentId',

  // ── Hệ thống ─────────────────────────────────────
  SYSTEM_ROOT: '/system',
  NOTIFICATIONS: '/notifications',
  AUDIT_LOGS: '/system/audit-logs',
  USER_MANAGEMENT: '/system/users',
  USERS: '/system/users', // Giữ lại để tránh break code cũ nếu có chỗ dùng

  // ── Trang lỗi ────────────────────────────────────
  FORBIDDEN: '/forbidden',  // 403 – không có quyền
  NOT_FOUND: '*',           // 404 – không tìm thấy trang
} as const;

// Type suy ra cho các giá trị path (dùng khi cần kiểu tường minh)
export type RoutePath = (typeof RoutePaths)[keyof typeof RoutePaths];
