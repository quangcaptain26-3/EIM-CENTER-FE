import { useMemo } from 'react';
import { cn } from '@/shared/lib/cn';
import type { RoleCode } from '@/shared/types/auth.type';

export type AvatarSize = 'sm' | 'md' | 'lg';

const sizeClass: Record<AvatarSize, string> = {
  sm: 'size-7 text-[10px]',
  md: 'size-9 text-xs',
  lg: 'size-12 text-sm',
};

/** 7 màu nền cố định — chọn theo hash tên (khi không có role) */
const BG_PALETTE = [
  'bg-violet-600 text-white',
  'bg-blue-600 text-white',
  'bg-cyan-600 text-white',
  'bg-emerald-600 text-white',
  'bg-amber-600 text-white',
  'bg-rose-600 text-white',
  'bg-brand-600 text-white',
] as const;

/** Gradient theo vai trò — sidebar / hồ sơ */
const ROLE_GRADIENT: Record<RoleCode, string> = {
  ADMIN: 'bg-gradient-to-br from-violet-500 to-violet-700 text-white',
  ACADEMIC: 'bg-gradient-to-br from-blue-500 to-blue-700 text-white',
  ACCOUNTANT: 'bg-gradient-to-br from-amber-500 to-amber-700 text-white',
  TEACHER: 'bg-gradient-to-br from-cyan-500 to-cyan-700 text-white',
};

function hashName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i += 1) {
    h = name.charCodeAt(i) + ((h << 5) - h);
  }
  return Math.abs(h);
}

function initialsFromName(name: string, maxChars = 2): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, maxChars).toUpperCase();
  const first = parts[0][0] ?? '';
  const last = parts[parts.length - 1][0] ?? '';
  return `${first}${last}`.toUpperCase().slice(0, maxChars);
}

export interface AvatarProps {
  name: string;
  size?: AvatarSize;
  className?: string;
  /** Nếu có — nền gradient theo vai trò thay vì hash tên */
  role?: RoleCode;
}

export function Avatar({ name, size = 'md', className, role }: AvatarProps) {
  const initials = useMemo(() => initialsFromName(name, 2), [name]);
  const bg = useMemo(() => {
    if (role && ROLE_GRADIENT[role]) return ROLE_GRADIENT[role];
    return BG_PALETTE[hashName(name) % BG_PALETTE.length];
  }, [name, role]);

  return (
    <span
      role="img"
      aria-label={name}
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold font-display',
        sizeClass[size],
        bg,
        className,
      )}
    >
      {initials}
    </span>
  );
}
