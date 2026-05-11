/**
 * Hợp đồng API (FE ↔ BE): một nguồn sự thật cho shape JSON.
 * Cập nhật song song với DTO/response backend; không đổi tên field tùy tiện.
 *
 * Quy ước chung:
 * - Ngày/giờ: chuỗi ISO (BE trả JSON).
 * - UUID: string.
 * - Tiền tệ (VND): number (có thể âm nếu API cho phép, xem từng field).
 */

// -----------------------------------------------------------------------------
// Common string unions (dùng lại trong nhiều response)
// -----------------------------------------------------------------------------

/** Mã vai trò người dùng — quyền UI và filter */
export type UserRoleCode = 'ADMIN' | 'ACADEMIC' | 'ACCOUNTANT' | 'TEACHER';

/** Mã chương trình / cấp — badge và logic lộ trình */
export type ProgramCode = 'KINDY' | 'STARTERS' | 'MOVERS' | 'FLYERS';

/** Ca học — filter lịch / phân công */
export type ShiftCode = 1 | 2;

/** Trạng thái lớp — pending thường là lớp chưa khai giảng */
export type ClassStatus = 'pending' | 'active' | 'closed';

/** Trạng thái buổi học */
export type SessionStatus = 'pending' | 'completed' | 'cancelled';

/** Trạng thái cover — phân biệt nháy dạy thay vs hủy cover */
export type CoverStatus = string;

/** Trạng thái ghi danh — trial/active ảnh hưởng enrollmentCount lớp */
export type EnrollmentStatus =
  | 'reserved'
  | 'pending'
  | 'trial'
  | 'active'
  | 'paused'
  | 'transferred'
  | 'dropped'
  | 'completed';

/** Điểm danh — absent_excused vs absent_unexcused ảnh hưởng cảnh báo nghỉ không phép */
export type AttendanceStatus = 'present' | 'late' | 'absent_excused' | 'absent_unexcused';

/** Phương thức thanh toán trên phiếu thu */
export type PaymentMethod = 'cash' | 'transfer';

// -----------------------------------------------------------------------------
// USERS & AUTH
// -----------------------------------------------------------------------------

/** Vai trò đầy đủ — BE trả nested trong UserResponse (khớp toUserResponse). */
export interface UserRoleResponse {
  id: string;
  code: UserRoleCode;
  name: string;
  permissions: string[];
}

/**
 * User trong mọi API trả “đủ hồ sơ” — không dùng nhầm với list rút gọn.
 * - role.permissions: dùng cho guard route / nút hành động (map sang AuthUser.permissions).
 * - salaryPerSession: chỉ meaningful với TEACHER; các role khác thường null/undefined.
 * - seniorityMonths: BE tính, không có cột DB; FE không tự tính lại để so khớp policy.
 */
export interface UserResponse {
  /** UUID */
  id: string;
  /** Mã hiển thị: EIM-ADM | NHV | NKT | GV-xxxxx — đừng nhầm với email */
  userCode: string;
  email: string;
  role: UserRoleResponse;
  isActive: boolean;
  fullName: string;
  gender?: string | null;
  dob?: string | null;
  phone?: string | null;
  address?: string | null;
  cccd?: string | null;
  nationality?: string | null;
  ethnicity?: string | null;
  religion?: string | null;
  educationLevel?: string | null;
  major?: string | null;
  startDate?: string | null;
  /** Chỉ giáo viên — null nếu không áp dụng */
  salaryPerSession?: number | null;
  allowance?: number | null;
  /** Thâm niên (tháng), computed tại BE — không persist trong DB */
  seniorityMonths?: number | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Sau đăng nhập / refresh — access ngắn hạn, refresh để lấy access mới.
 * user luôn là UserResponse đầy đủ theo policy hiện tại.
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
}

/**
 * Lịch sử đổi lương/phụ cấp — audit; old/new để diff rõ ràng.
 * - changedBy: thường là userId hoặc mã người thao tác (theo BE).
 */
export interface SalaryLog {
  id: string;
  oldSalaryPerSession: number | null;
  newSalaryPerSession: number | null;
  oldAllowance: number | null;
  newAllowance: number | null;
  changedBy: string;
  changedAt: string;
  reason: string | null;
}

// -----------------------------------------------------------------------------
// PROGRAMS & CLASSES
// -----------------------------------------------------------------------------

/**
 * Chương trình — defaultFee và totalSessions là default cho lớp mới, không phải học phí đã ghi danh.
 * - levelOrder: 1–4 để sort; không nhầm với sessionNo.
 */
export interface ProgramResponse {
  id: string;
  /** KINDY | STARTERS | MOVERS | FLYERS — khóa ngoại logic */
  code: ProgramCode;
  name: string;
  defaultFee: number;
  /** Thường 24 — tổng buổi chuẩn của chương trình */
  totalSessions: number;
  /** Thứ tự cấp 1–4 */
  levelOrder: number;
  isActive: boolean;
}

export interface RoomResponse {
  id: string;
  roomCode: string;
  capacity: number;
  isActive: boolean;
}

/** Giáo viên chủ nhiệm hiện tại — null nếu chưa gán */
export interface ClassCurrentTeacherRef {
  id: string;
  fullName: string;
  userCode: string;
}

/**
 * Lớp — enrollmentCount: chỉ trial + active hiện tại (theo rule BE), không phải mọi bản ghi lịch sử.
 * - scheduleDays: [2,4] = Thứ 2 + Thứ 4 — FE map sang label; không đổi thứ tự ngày nếu BE đã chuẩn.
 * - maxCapacity: thường 12 — giới hạn chỗ ngồi / chỗ học.
 * - programCode/programName: denormalize để list không cần join FE.
 */
export interface ClassResponse {
  id: string;
  /** EIM-LK | LS | LM | LF-xx — prefix theo program */
  classCode: string;
  programId: string;
  programCode: ProgramCode;
  programName: string;
  roomId: string;
  roomCode: string;
  shift: ShiftCode;
  /** 1=CN … hoặc convention BE — luôn number[] trước khi map label */
  scheduleDays: number[];
  minCapacity: number;
  /** Thường 12 */
  maxCapacity: number;
  status: ClassStatus;
  startDate: string;
  currentTeacher: ClassCurrentTeacherRef | null;
  enrollmentCount: number;
  /** Số buổi đã completed — tiến độ lớp */
  completedSessions: number;
}

/**
 * Lịch sử giáo viên theo buổi — effectiveFrom/To là session number, không phải ngày.
 * assignedAt: thời điểm gán record.
 */
export interface ClassStaffHistory {
  teacherId: string;
  fullName: string;
  effectiveFromSession: number;
  effectiveToSession: number | null;
  assignedAt: string;
}

// -----------------------------------------------------------------------------
// SESSIONS
// -----------------------------------------------------------------------------

/**
 * Cover — null trên SessionResponse nếu không có cover active.
 * - status: workflow cover (theo BE).
 */
export interface CoverInfo {
  coverTeacherId: string;
  coverTeacherName: string;
  reason: string | null;
  status: CoverStatus;
  assignedAt: string;
}

/**
 * Buổi học — teacherName là snapshot lúc tạo; đừng override bằng tên GV hiện tại nếu cần audit.
 * - sessionNo: 1–24 khớp chương trình.
 * - originalDate + rescheduleReason: khi đổi lịch.
 * - cover: null = không có cover hoặc không active.
 */
export interface SessionResponse {
  id: string;
  classId: string;
  classCode: string;
  teacherId: string;
  /** Snapshot tên GV khi tạo buổi */
  teacherName: string;
  sessionNo: number;
  sessionDate: string;
  shift: ShiftCode;
  status: SessionStatus;
  sessionNote: string | null;
  originalDate: string | null;
  rescheduleReason: string | null;
  cover: CoverInfo | null;
}

/**
 * Một dòng điểm danh — studentCode để hiển thị/tra cứu nhanh.
 */
export interface AttendanceRecord {
  studentId: string;
  /** Bắt buộc khi POST điểm danh buổi học */
  enrollmentId?: string;
  studentName?: string;
  studentCode?: string;
  status: AttendanceStatus;
  note?: string | null;
}

// -----------------------------------------------------------------------------
// STUDENTS & ENROLLMENTS
// -----------------------------------------------------------------------------

/**
 * Học viên — studentCode cố định (EIM-HS-xxxxx).
 * - currentLevel: cấp đang học hoặc null nếu chưa xác định / nghỉ.
 */
export interface StudentResponse {
  id: string;
  studentCode: string;
  fullName: string;
  dob: string | null;
  gender: string | null;
  address: string | null;
  schoolName: string | null;
  parentName: string | null;
  parentPhone: string | null;
  parentPhone2: string | null;
  parentZalo: string | null;
  currentLevel: ProgramCode | null;
  testResult: string | null;
  isActive: boolean;
}

/**
 * Ghi danh — tuitionFee là snapshot lúc ghi danh, IMMUTABLE; không thay bằng programs.defaultFee hiện tại.
 * - debt / presentCount / lateCount / excusedCount / unexcusedCount: BE có thể gửi sẵn hoặc FE tính từ DebtResponse + điểm danh — thống nhất một nguồn khi hiển thị.
 * - makeupBlocked: chặn xếp buổi bù khi policy kích hoạt.
 * - classTransferCount: 0 hoặc 1 theo nghiệp vụ.
 */
export interface EnrollmentResponse {
  id: string;
  studentId: string;
  programId: string;
  programCode: ProgramCode;
  classId: string;
  classCode: string;
  status: EnrollmentStatus;
  /** Học phí gói tại thời điểm ghi danh — không đổi sau khi tạo */
  tuitionFee: number;
  sessionsAttended: number;
  sessionsAbsent: number;
  classTransferCount: number;
  makeupBlocked: boolean;
  enrolledAt: string;
  paidAt: string | null;
  /** Có thể do BE hoặc suy ra từ receipts — hiển thị công nợ */
  debt?: number;
  presentCount?: number;
  lateCount?: number;
  excusedCount?: number;
  unexcusedCount?: number;
}

// -----------------------------------------------------------------------------
// FINANCE
// -----------------------------------------------------------------------------

/**
 * Phiếu thu — amount có thể âm (điều chỉnh / hoàn logic theo BE).
 * - amountInWords: bản chính thức từ BE khi lưu DB; FE chỉ được preview tạm, không ghi đè khi submit.
 * - voidedByReceiptId: null nếu là phiếu gốc; liên kết chuỗi void/hoàn.
 * - transferGroupId: gom nhóm phiếu cùng giao dịch chuyển khoản (nếu có).
 */
export interface ReceiptResponse {
  id: string;
  receiptCode: string;
  payerName: string;
  payerAddress: string | null;
  studentId: string;
  studentName: string;
  enrollmentId: string;
  reason: string;
  amount: number;
  /** Luôn lấy từ BE khi persist; FE không tự sinh làm dữ liệu chính thức */
  amountInWords: string;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  note: string | null;
  createdBy: string;
  payerSignatureName: string | null;
  voidedByReceiptId: string | null;
  transferGroupId: string | null;
}

/**
 * Tổng hợp công nợ theo ghi danh — debt khớp tuitionFee − (net receipts) theo rule BE.
 */
export interface DebtResponse {
  tuitionFee: number;
  totalPaid: number;
  totalRefunded: number;
  debt: number;
  receipts: ReceiptResponse[];
}

/**
 * Preview lương — totalSalary là ước tính trước khi chốt.
 * - sessionsAsMain / sessionsAsCover / sessionsCovered: tách để làm rõ cover không tính lương cho buổi bị thay.
 * - salaryPerSession / allowance: snapshot tại thời điểm preview; khi chốt tháng BE snapshot vào PayrollRecord.
 * - isFinalized: true nếu tháng này đã khóa bảng lương.
 */
export interface PayrollPreview {
  teacherId: string;
  teacherName: string;
  teacherCode: string;
  periodMonth: number;
  periodYear: number;
  /** Tổng buổi tính lương: main + cover */
  sessionsCount: number;
  sessionsAsMain: number;
  sessionsAsCover: number;
  /** Buổi bị người khác cover — không tính vào lương của GV này */
  sessionsCovered: number;
  salaryPerSession: number;
  allowance: number;
  totalSalary: number;
  sessions: PayrollSessionItem[];
  isFinalized: boolean;
}

export interface PayrollSessionItem {
  sessionId: string;
  sessionDate: string;
  classCode: string;
  wasCover: boolean;
}

/**
 * Bản ghi lương đã chốt — payrollCode EIM-PL-xxxxx; các field snapshot khớp preview tại thời điểm finalize.
 */
export interface PayrollRecord {
  id: string;
  payrollCode: string;
  teacherId: string;
  teacherName: string;
  teacherCode: string;
  periodMonth: number;
  periodYear: number;
  sessionsCount: number;
  sessionsAsMain: number;
  sessionsAsCover: number;
  sessionsCovered: number;
  salaryPerSession: number;
  allowance: number;
  totalSalary: number;
  finalizedAt: string;
}

// -----------------------------------------------------------------------------
// SEARCH
// -----------------------------------------------------------------------------

/** Mục tìm kiếm học viên — đủ để hiển thị autocomplete */
export interface StudentSearchItem {
  id: string;
  studentCode: string;
  fullName: string;
  /** Trạng thái hiển thị nhanh — optional tuỳ BE */
  status?: string | null;
}

export interface UserSearchItem {
  id: string;
  userCode: string;
  fullName: string;
  role?: UserRoleCode | null;
}

export interface ClassSearchItem {
  id: string;
  classCode: string;
  programName?: string | null;
  status?: ClassStatus | string | null;
}

/**
 * Global search — nhóm theo entity; mỗi nhóm list ngắn (top N) theo BE.
 */
export interface GlobalSearchResponse {
  students: StudentSearchItem[];
  users: UserSearchItem[];
  classes: ClassSearchItem[];
}

// -----------------------------------------------------------------------------
// PAGE WRAPPER & ERROR
// -----------------------------------------------------------------------------

/**
 * Wrapper chuẩn cho mọi API danh sách phân trang.
 * - totalPages: làm sẵn để tính UI pagination.
 */
export interface PagedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Lỗi API chuẩn — code để i18n / xử lý nhánh; message cho người dùng; details cho debug/validation.
 */
export interface ApiErrorResponse {
  code: string;
  message: string;
  details?: unknown;
}

// -----------------------------------------------------------------------------
// Extended / auxiliary API shapes (services & BE)
// -----------------------------------------------------------------------------

/**
 * GV dự kiến cover — giống UserResponse + trạng thái trống lịch.
 * conflictReason: lý do không thể nhận (null nếu isAvailable).
 */
export type CoverTeacherCandidate = UserResponse & {
  isAvailable: boolean;
  conflictReason: string | null;
};

/** Buổi học kèm điểm danh sau khi completed (BE có thể gộp trong GET /sessions/:id) */
export type SessionDetailResponse = SessionResponse & {
  attendance?: AttendanceRecord[];
};

/** Sau generate-sessions */
export interface GenerateSessionsResult {
  sessionsCreated: number;
  firstDate: string;
  lastDate: string;
}

/** Yêu cầu bảo lưu */
export interface PauseRequest {
  id: string;
  studentId?: string;
  studentName?: string;
  studentCode?: string;
  enrollmentId: string;
  classCode?: string | null;
  className?: string | null;
  sessionsAttended?: number | null;
  reason?: string;
  status: string;
  requestedAt?: string;
}

/** Buổi học bù */
export interface MakeupSession {
  id: string;
  code?: string;
  studentId?: string;
  studentName?: string;
  studentCode?: string;
  enrollmentId?: string;
  originalSessionNo?: number | null;
  originalDate?: string | null;
  scheduledDate?: string;
  status: string;
  roomId?: string;
  roomName?: string;
  teacherId?: string;
  teacherName?: string;
}

/** Dòng báo cáo tình hình đóng học phí (list finance) */
export interface PaymentStatusItem {
  enrollmentId: string;
  studentId: string;
  studentName: string;
  parentPhone?: string;
  classId: string;
  classCode?: string;
  programCode: ProgramCode | string;
  enrollmentStatus: EnrollmentStatus | string;
  tuitionFee: number;
  totalPaid: number;
  debt: number;
}

/** Dashboard tài chính — metric theo tháng */
export interface DashboardData {
  period: string;
  cashBasis: number;
  accrualBasis: number;
  cashTrendPercent?: number | null;
  totalDebt?: number | null;
  receiptCount?: number | null;
  newEnrollments: number;
  completions: number;
  drops: number;
  byProgram: {
    programCode: string;
    programName?: string;
    cashBasis: number;
    accrual: number;
    enrollments: number;
  }[];
  topDebtors?: { studentId: string; studentName: string; debt: number }[];
  pendingRefundCount?: number | null;
  pendingPauseCount?: number | null;
}

/** Yêu cầu hoàn phí */
export interface RefundRequest {
  id: string;
  requestCode: string;
  studentName?: string;
  enrollmentId: string;
  reasonType: string;
  reasonDetail: string;
  refundAmount: number;
  status: string;
  reviewedBy?: string;
  reviewNote?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Audit log (list system) */
export interface AuditLog {
  id: string;
  createdAt: string;
  actorId?: string;
  actorName?: string;
  actorCode?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  description?: string;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
}

/** Kết quả import bulk (preview hoặc commit) */
export interface ImportResult {
  success: boolean;
  rowsProcessed?: number;
  rowsCreated?: number;
  rowsUpdated?: number;
  rowsSkipped?: number;
  valid?: unknown[];
  validCount?: number;
  errorCount?: number;
  previewData?: unknown[];
  errors?: { row?: number; message: string; code?: string }[];
  preview?: unknown;
}

/** Payroll chi tiết — bản ghi chốt + danh sách buổi tính lương */
export interface PayrollRecordDetail extends PayrollRecord {
  sessions?: PayrollSessionItem[];
}

/**
 * POST /enrollments/:id/pause — BE trả một trong hai dạng:
 * - Tự do (<3 buổi): `{ requiresApproval: false, enrollment }`
 * - Cần duyệt: `{ requiresApproval: true, requestId }`
 */
export type PauseEnrollmentApiResponse =
  | { requiresApproval: true; requestId: string }
  | { requiresApproval: false; enrollment: EnrollmentResponse };

/** Sau khi FE parse — dùng trong UI */
export type PauseEnrollmentOutcome =
  | { kind: 'paused'; enrollment: EnrollmentResponse }
  | { kind: 'needsApproval'; requestId: string };
