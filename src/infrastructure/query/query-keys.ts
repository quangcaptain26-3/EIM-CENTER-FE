/**
 * Query keys — tham số khác nhau ⇒ cache khác nhau (đưa params vào mảng key).
 */
export const QUERY_KEYS = {
  AUTH: {
    me: ['auth', 'me'] as const,
  },

  DASHBOARD: {
    stats: ['dashboard', 'stats'] as const,
  },

  USERS: {
    list: (params: unknown) => ['users', 'list', params] as const,
    detail: (id: string) => ['users', id] as const,
    salaryLogs: (id: string) => ['users', id, 'salary-logs'] as const,
  },

  CLASSES: {
    list: (params: unknown) => ['classes', 'list', params] as const,
    detail: (id: string) => ['classes', id] as const,
    /** Không filter — luôn full buổi của lớp */
    sessions: (classId: string) => ['classes', classId, 'sessions'] as const,
    roster: (classId: string, params?: unknown) =>
      params != null ? (['classes', classId, 'roster', params] as const) : (['classes', classId, 'roster'] as const),
  },

  REFERENCE: {
    rooms: ['reference', 'rooms'] as const,
    programs: ['reference', 'programs'] as const,
  },

  SESSIONS: {
    detail: (id: string) => ['sessions', 'detail', id] as const,
    availableCovers: (sessionId: string) => ['sessions', sessionId, 'available-covers'] as const,
    conflictCheck: (sessionId: string, date: string) =>
      ['sessions', sessionId, 'conflict-check', date] as const,
    my: (params: unknown) => ['sessions', 'my', params] as const,
  },

  STUDENTS: {
    list: (params: unknown) => ['students', 'list', params] as const,
    detail: (id: string) => ['students', id] as const,
    enrollments: (id: string) => ['students', id, 'enrollments'] as const,
    search: (q: string) => ['students', 'search', q] as const,
  },

  ENROLLMENTS: {
    attendance: (enrollmentId: string) => ['enrollments', enrollmentId, 'attendance'] as const,
  },

  MAKEUP_SESSIONS: {
    list: (params: unknown) => ['makeup-sessions', 'list', params] as const,
  },

  PAUSE_REQUESTS: {
    list: (params: unknown) => ['pause-requests', 'list', params] as const,
  },

  FINANCE: {
    receipts: (params: unknown) => ['finance', 'receipts', params] as const,
    receipt: (id: string) => ['finance', 'receipt', id] as const,
    paymentStatus: (params: unknown) => ['finance', 'payment-status', params] as const,
    dashboard: (params: unknown) => ['finance', 'dashboard', params] as const,
    debt: (enrollmentId: string) => ['finance', 'debt', enrollmentId] as const,
    refundRequests: (params: unknown) => ['finance', 'refund-requests', params] as const,
    payrolls: (params: unknown) => ['payroll', 'list', params] as const,
    payroll: (id: string) => ['payroll', id] as const,
    /** @deprecated dùng PAYROLL.preview — gộp object khó so khớp với preview 3 tham số */
    payrollPreview: (params: unknown) => ['payroll', 'preview', params] as const,
  },

  /** Bảng lương — preview unique theo (teacherId, tháng, năm) */
  PAYROLL: {
    list: (params: unknown) => ['payroll', 'list', params] as const,
    detail: (id: string) => ['payroll', id] as const,
    preview: (teacherId: string, month: number, year: number) =>
      ['payroll', 'preview', teacherId, month, year] as const,
  },

  SEARCH: {
    global: (q: string) => ['search', 'global', q] as const,
    students: (params: unknown) => ['search', 'students', params] as const,
  },

  SYSTEM: {
    auditLogs: (params: unknown) => ['audit-logs', 'list', params] as const,
    import: (type: string, mode: string) => ['import', type, mode] as const,
    export: (type: string, params: unknown) => ['export', type, params] as const,
    template: (type: string) => ['templates', type] as const,
  },

  NOTIFICATIONS: {
    list: (limit: number) => ['notifications', 'list', limit] as const,
  },

  AUDIT: {
    list: (params: unknown) => ['audit-logs', 'list', params] as const,
  },
} as const;
