// query-keys.ts
// Tập trung tất cả factory tạo Query Key của TanStack/React Query.
// Đảm bảo tính nhất quán (không gõ sai chính tả key ở các file khác nhau)
// Cấu hình mảng [ 'module', 'hành-động', ...params ] chuẩn xác.

export const queryKeys = {
  // 1. Quản lý phiên đăng nhập
  auth: {
    me: ['auth', 'me'],
  },
  
  // 2. Giáo vụ - Khoá đào tạo (Curriculum)
  curriculum: {
    // curriculum.all đã xoá ngày 2026-03-15 do không dùng.
    programs: (params?: Record<string, unknown>) => ['curriculum', 'programs', params],
    program: (programId: string) => ['curriculum', 'program', programId],
    programUnits: (programId: string) => ['curriculum', 'programs', programId, 'units'],
    unit: (unitId: string) => ['curriculum', 'unit', unitId],
  },
  
  // 3. Học viên
  students: {
    all: ['students'],
    list: (params?: Record<string, unknown>) => ['students', 'list', params],
    detail: (id: string) => ['students', 'detail', id],
    enrollments: (studentId: string) => ['students', 'detail', studentId, 'enrollments'],
  },
  
  // 3b. Ghi danh (Enrollments)
  // enrollments.all và enrollments.detail đã bị xoá ngày 2026-03-15
  // Lý do: enrollment được quản lý qua studentKeys.enrollments(studentId) 
  // và classKeys.roster(classId) — không cần key riêng
  
  // 4. Lớp học
  classes: {
    all: ['classes'],
    list: (params?: Record<string, unknown>) => ['classes', 'list', params],
    detail: (id: string) => ['classes', 'detail', id],
    roster: (id: string) => ['classes', 'detail', id, 'roster'],
    schedules: (id: string) => ['classes', 'detail', id, 'schedules'],
    staff: (id: string) => ['classes', 'detail', id, 'staff'],
  },
  
  // 5. Phiên học (Sessions)
  sessions: {
    // sessions.all đã xoá ngày 2026-03-15 do không dùng.
    byClass: (classId: string) => ['sessions', 'by-class', classId],
    detail: (id: string) => ['sessions', 'detail', id],
    mySessionsByTeacher: (teacherId: string) => ['sessions', 'my-sessions', teacherId],
  },
  
  // 6. Điểm & Đánh giá
  feedback: {
    // feedback.all đã xoá ngày 2026-03-15 do không dùng.
    bySession: (sessionId: string) => ['feedback', 'by-session', sessionId],
    scoresBySession: (sessionId: string) => ['feedback', 'scores', 'by-session', sessionId],
    scoresByStudent: (studentId: string) => ['feedback', 'scores', 'by-student', studentId],
  },
  
  // 7. Học thử (Trials)
  trials: {
    /** Gốc namespace cho tất cả trial queries — dùng để invalidate toàn bộ */
    all: ['trials'] as const,
    /** Danh sách có filter (status, search, phân trang) */
    filtered: (params?: Record<string, unknown>) => ['trials', 'list', params] as const,
    /** Chi tiết một trial lead theo ID */
    detail: (id: string) => ['trials', 'detail', id] as const,
  },
  
  // 8. Tài chính (Billing)
  finance: {
    all: ['finance'],
    feePlans: (params?: Record<string, unknown>) => ['finance', 'fee-plans', params],
    invoices: (params?: Record<string, unknown>) => ['finance', 'invoices', params],
    invoiceDetail: (id: string) => ['finance', 'invoice', id],
    overdueInvoices: ['finance', 'invoices', 'overdue'],
    studentFinance: (studentId: string) => ['finance', 'student-summary', studentId],
    /** Danh sách trạng thái thanh toán học sinh (đã đóng/chưa đóng theo enrollment+invoice) */
    studentPaymentStatus: (params?: Record<string, unknown>) =>
      ['finance', 'student-payment-status', params],
  },
  
  // 9. Hệ thống Cấu hình - Log - Quản lý User
  system: {
    notifications: (params?: any) => ['system', 'notifications', params] as const,
    unreadCount: ['system', 'notifications', 'unread-count'] as const,
    auditLogs: (params?: any) => ['system', 'audit-logs', params] as const,
    users: (params?: any) => ['system', 'users', params] as const,
    userDetail: (id: string) => ['system', 'users', 'detail', id] as const,
  },
} as const;
