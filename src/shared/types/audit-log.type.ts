export interface AuditLogRow {
  id: string;
  createdAt: string;
  actorId?: string;
  actorName?: string;
  actorCode?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  entityCode?: string;
  description?: string;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  diff?: Record<string, unknown> | null;
}

/** Nhóm filter UI → gửi API (tuỳ BE: action hoặc actionType) */
export const AUDIT_ACTION_GROUPS: { label: string; options: { value: string; label: string }[] }[] = [
  {
    label: 'AUTH',
    options: [
      { value: 'login', label: 'login' },
      { value: 'logout', label: 'logout' },
    ],
  },
  {
    label: 'USER',
    options: [
      { value: 'user_created', label: 'created' },
      { value: 'user_updated', label: 'updated' },
      { value: 'salary_updated', label: 'salary_updated' },
      { value: 'user_deleted', label: 'deleted' },
    ],
  },
  {
    label: 'CLASS',
    options: [
      { value: 'sessions_generated', label: 'sessions_generated' },
      { value: 'cover_assigned', label: 'cover_assigned' },
      { value: 'rescheduled', label: 'rescheduled' },
      { value: 'teacher_replaced', label: 'teacher_replaced' },
    ],
  },
  {
    label: 'ENROLLMENT',
    options: [
      { value: 'enrollment_created', label: 'created' },
      { value: 'activated', label: 'activated' },
      { value: 'paused', label: 'paused' },
      { value: 'dropped', label: 'dropped' },
      { value: 'completed', label: 'completed' },
    ],
  },
  {
    label: 'ATTENDANCE',
    options: [
      { value: 'attendance_recorded', label: 'recorded' },
      { value: 'makeup_created', label: 'makeup_created' },
    ],
  },
  {
    label: 'FINANCE',
    options: [
      { value: 'receipt_created', label: 'receipt_created' },
      { value: 'payroll_finalized', label: 'payroll_finalized' },
    ],
  },
  {
    label: 'SYSTEM',
    options: [
      { value: 'bulk_import', label: 'bulk_import' },
      { value: 'export', label: 'export' },
    ],
  },
];

export const AUDIT_ENTITY_TYPES = [
  { value: '', label: 'Tất cả' },
  { value: 'user', label: 'User' },
  { value: 'class', label: 'Class' },
  { value: 'session', label: 'Session' },
  { value: 'enrollment', label: 'Enrollment' },
  { value: 'student', label: 'Student' },
  { value: 'receipt', label: 'Receipt' },
  { value: 'payroll', label: 'Payroll' },
  { value: 'other', label: 'Khác' },
];
