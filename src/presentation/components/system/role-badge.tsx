import type { RoleCode } from '@/shared/types/auth.type';

const ROLE_STYLES: Record<
  RoleCode,
  string
> = {
  ADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
  ACADEMIC: 'bg-blue-100 text-blue-800 border-blue-200',
  ACCOUNTANT: 'bg-amber-100 text-amber-900 border-amber-200',
  TEACHER: 'bg-teal-100 text-teal-800 border-teal-200',
};

const ROLE_LABELS: Record<RoleCode, string> = {
  ADMIN: 'Quản trị',
  ACADEMIC: 'Đào tạo',
  ACCOUNTANT: 'Kế toán',
  TEACHER: 'Giáo viên',
};

interface RoleBadgeProps {
  role: RoleCode;
  className?: string;
}

export function RoleBadge({ role, className = '' }: RoleBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${ROLE_STYLES[role]} ${className}`}
    >
      {ROLE_LABELS[role]}
    </span>
  );
}
