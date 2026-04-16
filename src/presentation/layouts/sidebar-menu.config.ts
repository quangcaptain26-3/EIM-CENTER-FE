import { PATHS } from '@/app/router/route-paths';
import { ROLES } from '@/shared/constants/roles';
import type { RoleCode } from '@/shared/types/auth.type';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  PauseCircle,
  Calendar,
  Repeat2,
  Receipt,
  CreditCard,
  Banknote,
  RefreshCcw,
  BarChart3,
  ScrollText,
} from 'lucide-react';

const { ADMIN, ACADEMIC, ACCOUNTANT, TEACHER } = ROLES;

export type SidebarBadgeKey = 'pause-pending';

export type SidebarGroupId = 'overview' | 'operations' | 'finance' | 'system';

export const SIDEBAR_GROUP_ORDER: SidebarGroupId[] = [
  'overview',
  'operations',
  'finance',
  'system',
];

export const SIDEBAR_GROUP_LABELS: Record<SidebarGroupId, string> = {
  overview: 'TỔNG QUAN',
  operations: 'VẬN HÀNH',
  finance: 'TÀI CHÍNH',
  system: 'HỆ THỐNG',
};

export interface SidebarMenuItem {
  label: string;
  path: string;
  icon: LucideIcon;
  group: SidebarGroupId;
  /** Rỗng = mọi role đã đăng nhập (không dùng) — luôn khai báo role cụ thể */
  requiredRoles: readonly RoleCode[];
  /** Badge đặc biệt (số lấy từ API ở layout) */
  badgeKey?: SidebarBadgeKey;
  /** NavLink `end` — chỉ khớp đúng path */
  end?: boolean;
}

/**
 * Menu sidebar — nhóm cố định, thứ tự trong nhóm cố định, khớp RBAC backend.
 */
export const SIDEBAR_MENU_ITEMS: SidebarMenuItem[] = [
  {
    label: 'Dashboard',
    path: PATHS.DASHBOARD,
    icon: LayoutDashboard,
    group: 'overview',
    requiredRoles: [ADMIN, ACADEMIC, ACCOUNTANT, TEACHER],
    end: true,
  },
  {
    label: 'Lớp học',
    path: PATHS.CLASSES,
    icon: BookOpen,
    group: 'operations',
    requiredRoles: [ADMIN, ACADEMIC],
  },
  {
    label: 'Học viên',
    path: PATHS.STUDENTS,
    icon: GraduationCap,
    group: 'operations',
    requiredRoles: [ADMIN, ACADEMIC],
  },
  {
    label: 'Bảo lưu',
    path: PATHS.PAUSE_REQUESTS,
    icon: PauseCircle,
    group: 'operations',
    requiredRoles: [ADMIN, ACADEMIC],
    badgeKey: 'pause-pending',
  },
  {
    label: 'Lịch dạy',
    path: PATHS.MY_SESSIONS,
    icon: Calendar,
    group: 'operations',
    requiredRoles: [ADMIN, ACADEMIC, TEACHER],
  },
  {
    label: 'Học bù',
    path: PATHS.MAKEUP_SESSIONS,
    icon: Repeat2,
    group: 'operations',
    requiredRoles: [ADMIN, ACADEMIC],
  },
  {
    label: 'Phiếu thu',
    path: PATHS.RECEIPTS,
    icon: Receipt,
    group: 'finance',
    requiredRoles: [ADMIN, ACCOUNTANT],
  },
  {
    label: 'Công nợ',
    path: PATHS.PAYMENT_STATUS,
    icon: CreditCard,
    group: 'finance',
    requiredRoles: [ADMIN, ACCOUNTANT],
  },
  {
    label: 'Chốt lương',
    path: PATHS.PAYROLL,
    icon: Banknote,
    group: 'finance',
    requiredRoles: [ADMIN, ACCOUNTANT],
  },
  {
    label: 'Hoàn phí',
    path: PATHS.REFUND_REQUESTS,
    icon: RefreshCcw,
    group: 'finance',
    requiredRoles: [ADMIN, ACCOUNTANT],
  },
  {
    label: 'Tổng quan TC',
    path: PATHS.FINANCE_DASHBOARD,
    icon: BarChart3,
    group: 'finance',
    requiredRoles: [ADMIN, ACCOUNTANT],
  },
  {
    label: 'Nhân sự',
    path: PATHS.USERS,
    icon: Users,
    group: 'system',
    requiredRoles: [ADMIN],
  },
  {
    label: 'Audit Log',
    path: PATHS.AUDIT_LOGS,
    icon: ScrollText,
    group: 'system',
    requiredRoles: [ADMIN],
  },
];
